/**
 * One-off cleanup: the archive alt-text fallback produced redundant strings like
 * "Golz Launch - June 2015, 2015" because every event folder name already
 * contains its year. Rewrites those to the caption alone.
 *
 * Safe to re-run: only touches items whose alt is exactly "<caption>, <year>".
 * Run: node server/scripts/fix-archive-alt.mjs [--dry-run]
 */
import "dotenv/config";
import mongoose from "mongoose";
import GalleryItem from "../src/models/GalleryItem.js";

const DRY_RUN = process.argv.includes("--dry-run");
const YEARS = ["2015", "2017", "2018", "2019", "2020"];

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);
console.log(`connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

const items = await GalleryItem.find({ category: { $in: YEARS } }).lean();
let fixed = 0;
const changes = [];

for (const i of items) {
  const redundant = `${i.caption}, ${i.category}`;
  if (i.alt === redundant) {
    changes.push({ id: i._id, from: i.alt, to: i.caption });
    fixed += 1;
  }
}

console.log(`\narchive items: ${items.length}`);
console.log(`redundant alt strings: ${fixed}`);
for (const c of changes) console.log(`  "${c.from}"  ->  "${c.to}"`);

if (!DRY_RUN && fixed) {
  for (const c of changes) {
    await GalleryItem.updateOne({ _id: c.id }, { $set: { alt: c.to } });
  }
  console.log(`\nupdated ${fixed} item(s)`);
} else if (DRY_RUN) {
  console.log("\n(dry run - no writes)");
} else {
  console.log("\nnothing to do");
}

await mongoose.disconnect();
process.exit(0);
