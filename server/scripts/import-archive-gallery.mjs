/**
 * Imports the optimised historical archive photos (produced by
 * `optimise-archive-images.mjs`) into the live GOLZ gallery.
 *
 * For each year folder it creates/updates a GallerySection (name = year) and one
 * GalleryItem per photo, with a Media record so the admin Media Library and the
 * delete-cleanup path keep working.
 *
 * Uploads to Vercel Blob at a DETERMINISTIC pathname (addRandomSuffix: false)
 * and upserts by that pathname / item url, so the script is safe to re-run:
 * re-running overwrites the same blobs and updates the same rows rather than
 * creating duplicates.
 *
 * Nothing outside these year sections is touched.
 *
 * Run:  node server/scripts/import-archive-gallery.mjs [--dry-run]
 */
import "dotenv/config";
import os from "os";
import path from "path";
import fs from "fs";
import mongoose from "mongoose";
import { put } from "@vercel/blob";

import GalleryItem from "../src/models/GalleryItem.js";
import GallerySection from "../src/models/GallerySection.js";
import Media from "../src/models/Media.js";

const DRY_RUN = process.argv.includes("--dry-run");
const OUT = path.join(os.tmpdir(), "golz-archive-optimised");
const MANIFEST = path.join(OUT, "manifest.json");
const BLOB_ROOT = "golz/gallery/archive";
const UPLOADED_BY = "archive-import";

if (!process.env.BLOB_READ_WRITE_TOKEN) throw new Error("BLOB_READ_WRITE_TOKEN is not set");
if (!fs.existsSync(MANIFEST)) {
  throw new Error(`Manifest not found: ${MANIFEST}\nRun optimise-archive-images.mjs first.`);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
if (!manifest.length) throw new Error("Manifest is empty");

const years = [...new Set(manifest.map((m) => m.year))].sort();
console.log(`=== ARCHIVE IMPORT${DRY_RUN ? " (DRY RUN - no writes)" : ""} ===`);
console.log(`images: ${manifest.length}   years: ${years.join(", ")}\n`);

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);
console.log(`connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

// Order new sections after the existing ones so current layout is preserved.
let sectionOrder = (await GallerySection.findOne().sort({ order: -1 }).lean())?.order ?? 0;
let itemOrder = (await GalleryItem.findOne().sort({ order: -1 }).lean())?.order ?? 0;
console.log(`starting section order after ${sectionOrder}, item order after ${itemOrder}\n`);

const stats = { sections: 0, created: 0, updated: 0, media: 0, bytes: 0, skipped: 0 };
const sectionIds = new Map();

for (const year of years) {
  const rows = manifest.filter((m) => m.year === year);

  // ---- section (name must equal the item category: the public section count
  //      and the client-side grouping both match on the name string) ----
  let section = await GallerySection.findOne({ name: new RegExp(`^${year}$`, "i") }).lean();
  if (!section) {
    sectionOrder += 1;
    if (DRY_RUN) {
      section = { _id: null, order: sectionOrder };
      console.log(`section WOULD CREATE  "${year}"  order=${sectionOrder}`);
    } else {
      const created = await GallerySection.create({
        name: year,
        title: year,
        description: "",
        cover: "",
        order: sectionOrder,
        published: true,
      });
      section = created.toObject();
      stats.sections += 1;
      console.log(`section CREATED  "${year}"  order=${sectionOrder}`);
    }
  } else {
    console.log(`section EXISTS   "${year}"  order=${section.order}`);
  }
  sectionIds.set(year, section._id);

  for (const row of rows) {
    const filePath = path.join(OUT, row.year, row.file);
    if (!fs.existsSync(filePath)) {
      console.warn(`  SKIP missing file: ${row.year}/${row.file}`);
      stats.skipped += 1;
      continue;
    }
    const data = fs.readFileSync(filePath);
    const pathname = `${BLOB_ROOT}/${row.year}/${row.file}`;

    if (DRY_RUN) {
      console.log(`  would upload ${pathname} (${Math.round(data.length / 1024)}KB)`);
      stats.bytes += data.length;
      continue;
    }

    // ---- blob (deterministic pathname => re-runs overwrite, never duplicate)
    const blob = await put(pathname, data, {
      access: "public",
      contentType: "image/jpeg",
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    // ---- media record (deduped on storageKey, like ensureMediaRecord)
    const media = await Media.findOneAndUpdate(
      { storageKey: pathname },
      {
        $set: {
          filename: `${row.year}-${row.file.split("/").pop()}`,
          url: blob.url,
          thumb: blob.url,
          storage: "blob",
          assetId: "",
          resourceType: "image",
          contentType: "image/jpeg",
          size: data.length,
          uploadedBy: UPLOADED_BY,
          gallerySectionId: year,
        },
        $setOnInsert: { storageKey: pathname },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    stats.media += 1;
    stats.bytes += data.length;

    // ---- gallery item, upserted by url so re-runs update in place
    const existing = await GalleryItem.findOne({ url: blob.url });
    const fields = {
      type: "image",
      url: blob.url,
      thumb: blob.url,
      category: year,
      gallerySectionId: section._id,
      caption: row.caption,
      description: "",
      alt: row.alt,
      published: true,
    };

    if (existing) {
      await GalleryItem.updateOne({ _id: existing._id }, { $set: fields });
      stats.updated += 1;
      console.log(`  item UPDATED  order=${existing.order}  ${row.caption}  ${row.file}`);
    } else {
      itemOrder += 1;
      await GalleryItem.create({ ...fields, order: itemOrder, featured: false });
      stats.created += 1;
      console.log(`  item CREATED  order=${itemOrder}  ${row.caption}  ${row.file}`);
    }
  }
}

// Use the first photo of each year as the section header thumbnail.
if (!DRY_RUN) {
  for (const year of years) {
    const first = await GalleryItem.findOne({ category: year }).sort({ order: 1 }).lean();
    if (first) await GallerySection.updateOne({ _id: sectionIds.get(year) }, { $set: { cover: first.url } });
  }
}

// ---- verify what the public endpoints will actually serve ----
if (!DRY_RUN) {
  console.log("\n=== VERIFY ===");
  const sections = await GallerySection.find({}).sort({ order: 1 }).lean();
  for (const s of sections) {
    const n = await GalleryItem.countDocuments({ category: s.name, published: true });
    console.log(`  order=${s.order}  "${s.name}"  title="${s.title}"  publishedItems=${n}  cover=${s.cover ? "set" : "none"}`);
  }
  // Join item.url -> Media.url properly (GalleryItem has no storageKey field,
  // so a $exists check on it would match every document and report nonsense).
  const mediaUrls = new Set((await Media.find({}, { url: 1 }).lean()).map((m) => m.url));
  const archive = await GalleryItem.find({ category: { $in: years } }, { url: 1, category: 1 }).lean();
  const noMedia = archive.filter((i) => !mediaUrls.has(i.url));
  const noUrl = archive.filter((i) => !i.url);
  console.log(`  archive items: ${archive.length}, missing media record: ${noMedia.length}, empty url: ${noUrl.length}`);
  if (noMedia.length) {
    console.log("  first missing:", noMedia.slice(0, 3).map((i) => i.url).join(", "));
  }
}

console.log("\n=== SUMMARY ===");
console.log("sections created :", stats.sections);
console.log("items created    :", stats.created);
console.log("items updated    :", stats.updated);
console.log("media records    :", stats.media);
console.log("skipped          :", stats.skipped);
console.log("bytes uploaded   :", (stats.bytes / 1024 / 1024).toFixed(1), "MB");

await mongoose.disconnect();
process.exit(0);
