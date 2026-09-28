/**
 * One-off archive optimiser: resizes the raw historical photos in `public/<year>/`
 * down to web size and writes them (plus a manifest) to a temp folder for the
 * gallery import script.
 *
 * The originals are 4608x3456 phone photos at 5-6 MB each (173 MB total), which
 * is far too heavy to deploy or to page-load. sharp is used (rather than
 * System.Drawing) because it applies EXIF orientation automatically.
 *
 * Run:  node server/scripts/optimise-archive-images.mjs
 * Deps: sharp -- installed on demand, NOT added to package.json.
 */
import fs from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..", "..");
const SRC = path.join(REPO, "public");
const OUT = path.join(os.tmpdir(), "golz-archive-optimised");

const MAX_EDGE = 1600;
const QUALITY = 82;
const EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif"]);

/** Files that are not photos (office docs, pdfs, Windows thumbnails). */
const isSkippable = (name) => /^(thumbs\.db|desktop\.ini|\.~lock)/i.test(name) || !EXT.has(path.extname(name).toLowerCase());

const slug = (s) =>
  s
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/['\u2019]/g, "")
    .replace(/&/g, " and ")
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "item";

/** Collapse whitespace but keep the wording exactly as the photographer wrote it. */
const clean = (s) => s.replace(/\s+/g, " ").trim();

const GENERIC = /^(pic|pics|img|image|images|photo|photos|pxl|p|dsc|dscn|dscno|file|untitled|screenshot)?[\s._-]*\d*[\s._-]*$/i;

/** Prefer the descriptive filename for alt text; fall back to the event name.
 *  Every archive event folder already names its year, so only append the year
 *  when the caption does not already contain it. */
function altFor(fileStem, event, year) {
  const stem = clean(fileStem);
  if (stem.length > 14 && !GENERIC.test(stem)) return stem;
  return event.includes(year) ? event : `${event}, ${year}`;
}

/** sharp is callable via require(); older/newer builds may expose it on `.default`. */
function loadSharp() {
  const mod = (() => {
    try {
      return require("sharp");
    } catch {
      console.log("sharp not found - installing (not saved to package.json)...");
      execSync("npm install sharp --no-save --no-audit --no-fund", { cwd: REPO, stdio: "inherit" });
      return require("sharp");
    }
  })();
  const fn = typeof mod === "function" ? mod : mod?.default;
  if (typeof fn !== "function") throw new Error("Could not load a callable sharp export");
  return fn;
}

const sharp = loadSharp();

if (!fs.existsSync(SRC)) throw new Error(`Source not found: ${SRC}`);
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

const years = fs
  .readdirSync(SRC, { withFileTypes: true })
  .filter((d) => d.isDirectory() && /^\d{4}$/.test(d.name))
  .map((d) => d.name)
  .sort();

if (!years.length) throw new Error(`No year folders (YYYY) found in ${SRC}`);

const manifest = [];
const skipped = [];
/** Guards against slug collisions (e.g. "Pictures of the program  - WCD.jpg"
 *  vs "Pictures of the program -  WCD.jpg" both slug to the same name). */
const usedDest = new Set();
let srcBytes = 0;
let outBytes = 0;

for (const year of years) {
  const yearDir = path.join(SRC, year);
  for (const sub of fs.readdirSync(yearDir, { withFileTypes: true }).filter((d) => d.isDirectory()).sort((a, b) => a.name.localeCompare(b.name))) {
    const event = clean(sub.name);
    const eventSlug = slug(event);
    for (const f of fs.readdirSync(path.join(yearDir, sub.name), { withFileTypes: true }).filter((d) => d.isFile()).sort((a, b) => a.name.localeCompare(b.name))) {
      const srcPath = path.join(yearDir, sub.name, f.name);
      if (isSkippable(f.name)) {
        skipped.push(path.relative(SRC, srcPath));
        continue;
      }
      const stem = clean(path.basename(f.name, path.extname(f.name)));
      const base = slug(stem);
      const destDir = path.join(OUT, year, eventSlug);
      fs.mkdirSync(destDir, { recursive: true });

      // Disambiguate slug collisions so no source image is silently lost.
      let destName = `${base}.jpg`;
      for (let n = 2; usedDest.has(`${year}/${eventSlug}/${destName}`); n++) destName = `${base}-${n}.jpg`;
      const destKey = `${year}/${eventSlug}/${destName}`;
      usedDest.add(destKey);
      const destPath = path.join(destDir, destName);
      if (destName !== `${base}.jpg`) console.warn(`  ! name collision -> ${destName}`);

      try {
        const meta = await sharp(srcPath, { failOn: "none" }).metadata();
        const buf = await sharp(srcPath, { failOn: "none" })
          .rotate()
          .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
          .jpeg({ quality: QUALITY, mozjpeg: true, progressive: true, chromaSubsampling: "4:4:4" })
          .toBuffer();
        const after = await sharp(buf).metadata();

        fs.writeFileSync(destPath, buf);
        srcBytes += fs.statSync(srcPath).size;
        outBytes += buf.length;
        manifest.push({
          year,
          event,
          eventSlug,
          original: path.relative(SRC, srcPath),
          file: `${eventSlug}/${destName}`,
          caption: event,
          alt: altFor(stem, event, year),
          width: after.width,
          height: after.height,
          bytes: buf.length,
        });
        console.log(
          `${year}  ${event}  ${String(meta.width || "?").padStart(4)}x${String(meta.height || "?").padEnd(4)} ` +
            `${String(Math.round(fs.statSync(srcPath).size / 1024)).padStart(5)}KB -> ${String(Math.round(buf.length / 1024)).padStart(4)}KB  ` +
            `${after.width}x${after.height}  ${path.basename(destName)}`
        );
      } catch (err) {
        console.error(`FAILED ${path.relative(SRC, srcPath)}: ${err.message}`);
      }
    }
  }
}

fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));

// Integrity check: every manifest row must map to a distinct file that exists on disk.
const onDisk = [];
for (const year of years) {
  const yd = path.join(OUT, year);
  if (!fs.existsSync(yd)) continue;
  for (const sub of fs.readdirSync(yd, { withFileTypes: true }).filter((d) => d.isDirectory())) {
    for (const f of fs.readdirSync(path.join(yd, sub.name))) onDisk.push(`${year}/${sub.name}/${f}`);
  }
}
const manifestKeys = new Set(manifest.map((m) => `${m.year}/${m.file}`));
const collisions = manifestKeys.size !== manifest.length;
const missing = [...manifestKeys].filter((k) => !onDisk.includes(k));
const orphans = onDisk.filter((k) => !manifestKeys.has(k));

console.log("\n=== SUMMARY ===");
console.log("years        :", years.join(", "));
console.log("images       :", manifest.length);
console.log("files on disk:", onDisk.length);
console.log("slug clashes :", collisions ? "YES (see warnings above)" : "none");
console.log("missing      :", missing.length ? missing.join(", ") : "none");
console.log("orphaned     :", orphans.length ? orphans.join(", ") : "none");
console.log("skipped      :", skipped.length, skipped.length ? `(${skipped.join(", ")})` : "");
console.log("original     :", (srcBytes / 1024 / 1024).toFixed(1), "MB");
console.log("optimised    :", (outBytes / 1024 / 1024).toFixed(1), "MB");
console.log("reduction    :", (100 - (outBytes / srcBytes) * 100).toFixed(1), "%");
console.log("output       :", OUT);

if (missing.length || collisions) {
  console.error("\nFAILED integrity check - manifest and output do not agree.");
  process.exit(1);
}
console.log("\nIntegrity check OK.");
