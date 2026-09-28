/**
 * Builds structured gallery metadata (image -> year -> eventName -> caption)
 * for the archive photos and writes it to the live GalleryItem collection.
 *
 * Source of truth is the folder/filename layout of the original archive:
 *   public/<year>/<event name>/<photo name>.<ext>
 *   - year       <- the year folder
 *   - eventName  <- the event folder name
 *   - caption    <- the photo name when it actually describes the photo,
 *                   otherwise the event name (filenames like "Pic 1.JPG" or
 *                   "1.jpg" carry no information, so they must not be shown)
 *
 * Nothing is invented: no generated prose, no guessed event names. Images whose
 * filename is not descriptive fall back to their event name.
 *
 * Idempotent - safe to re-run. Use --dry-run to preview.
 *
 * Run: node server/scripts/build-gallery-metadata.mjs [--dry-run]
 */
import "dotenv/config";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import GalleryItem from "../src/models/GalleryItem.js";

const DRY_RUN = process.argv.includes("--dry-run");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const SRC = path.join(REPO, "public");
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);
const YEAR_RE = /^\d{4}$/;

const clean = (s) => s.replace(/\s+/g, " ").trim();

/** MUST stay identical to the slug() in optimise-archive-images.mjs. */
const slug = (s) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "item";

/** Filenames that carry no descriptive information. */
const GENERIC = /^(pic|pics|img|image|images|photo|photos|pxl|p|dsc|dscn|dscno|file|untitled|screenshot|ncd)[-\s._]*\d*[-\s._]*$/i;

/** Descriptive when it reads like a sentence rather than a camera filename. */
const isDescriptive = (stem) => clean(stem).length > 14 && !GENERIC.test(clean(stem));

const captionFor = (stem, event) => (isDescriptive(stem) ? clean(stem) : event);

// ---------------------------------------------------------------- source scan
if (!fs.existsSync(SRC)) throw new Error(`Archive source not found: ${SRC}`);
const years = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory() && YEAR_RE.test(d.name))
  .map((d) => d.name)
  .sort();

/** year|event|fileSlug -> the metadata we intend to store. */
const desired = new Map();
const usedDest = new Set();
for (const year of years) {
  for (const sub of fs.readdirSync(path.join(SRC, year), { withFileTypes: true }).filter((d) => d.isDirectory())) {
    const event = clean(sub.name);
    const eventSlug = slug(event);
    for (const f of fs.readdirSync(path.join(SRC, year, sub.name), { withFileTypes: true }).filter((d) => d.isFile())) {
      if (!EXT.has(path.extname(f.name).toLowerCase())) continue;
      const stem = clean(path.basename(f.name, path.extname(f.name)));
      // Mirror the optimiser's collision handling so keys line up with Blob URLs.
      const base = slug(stem);
      let destName = `${base}.jpg`;
      for (let n = 2; usedDest.has(`${year}/${eventSlug}/${destName}`); n++) destName = `${base}-${n}.jpg`;
      usedDest.add(`${year}/${eventSlug}/${destName}`);
      desired.set(`${year}|${eventSlug}|${destName.replace(/\.jpg$/, "")}`, {
        year,
        event,
        caption: captionFor(stem, event),
      });
    }
  }
}
console.log(`=== GALLERY METADATA${DRY_RUN ? " (DRY RUN)" : ""} ===`);
console.log(`source images: ${desired.size}  years: ${years.join(", ")}\n`);

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);
console.log(`connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

const items = await GalleryItem.find({ category: { $in: years } });
console.log(`archive items in db: ${items.length}\n`);

const used = new Set();
const updates = [];
const unmatched = [];

for (const item of items) {
  const m = item.url.match(/archive\/(\d{4})\/([^/]+)\/([^/]+)$/);
  if (!m) {
    unmatched.push({ url: item.url, reason: "url is not an archive path" });
    continue;
  }
  const [, year, eventSlug, fileSlug] = m;
  const fileStem = fileSlug.replace(/\.jpe?g$/i, "");
  const key = `${year}|${eventSlug}|${fileStem}`;
  const meta = desired.get(key);
  if (!meta) {
    unmatched.push({ url: item.url, reason: `no source image for ${key}` });
    continue;
  }
  used.add(key);
  const changed =
    item.year !== meta.year || item.eventName !== meta.event || item.caption !== meta.caption || item.alt !== meta.caption;
  updates.push({ item, meta, changed });
}

const orphaned = [...desired.keys()].filter((k) => !used.has(k));

if (unmatched.length) {
  console.log("UNMATCHED DB ITEMS:");
  for (const u of unmatched) console.log(`  ${u.reason}  ${u.url}`);
}
if (orphaned.length) {
  console.log("SOURCE IMAGES WITH NO DB ITEM:");
  for (const k of orphaned) console.log(`  ${k}`);
}

console.log(`\nmatched: ${updates.length} / ${items.length}`);
console.log(`  unmatched: ${unmatched.length}   orphaned source images: ${orphaned.length}\n`);

console.log("=== IMAGE -> YEAR -> EVENT -> CAPTION ===");
for (const { item, meta, changed } of updates) {
  console.log(`${changed ? "*" : " "} ${meta.year}  ${meta.event}`);
  console.log(`    caption: ${meta.caption}`);
  if (DRY_RUN) continue;
  item.year = meta.year;
  item.eventName = meta.event;
  item.caption = meta.caption;
  item.alt = meta.caption;
  await item.save();
}

const changedCount = updates.filter((u) => u.changed).length;

console.log("\n=== SUMMARY ===");
console.log("items updated :", DRY_RUN ? "(dry run)" : updates.length);
console.log("needing change:", changedCount);
console.log("items with no caption:", updates.filter(({ meta }) => !meta.caption).length);
console.log("items with no event  :", updates.filter(({ meta }) => !meta.event).length);

await mongoose.disconnect();
process.exit(unmatched.length || orphaned.length ? 1 : 0);
