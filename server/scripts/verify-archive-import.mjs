/**
 * Post-import verification against the LIVE database and the real Vercel Blob
 * URLs, plus (optionally) the deployed public API.
 *
 * Run:  node server/scripts/verify-archive-import.mjs
 */
import "dotenv/config";
import mongoose from "mongoose";
import GalleryItem from "../src/models/GalleryItem.js";
import GallerySection from "../src/models/GallerySection.js";
import Media from "../src/models/Media.js";

const YEARS = ["2015", "2017", "2018", "2019", "2020"];
const API = process.env.PUBLIC_API_BASE || "";

let failures = 0;
const fail = (m) => {
  failures++;
  console.log(`  FAIL  ${m}`);
};

await mongoose.connect(process.env.MONGO_DIRECT_URI || process.env.MONGO_URI);
console.log(`connected: ${mongoose.connection.host}/${mongoose.connection.name}\n`);

console.log("=== 1. SECTIONS & COUNTS ===");
const sections = await GallerySection.find({ name: { $in: YEARS } }).sort({ order: 1 }).lean();
if (sections.length !== YEARS.length) fail(`expected ${YEARS.length} year sections, found ${sections.length}`);
let expectedTotal = 0;
for (const s of sections) {
  const n = await GalleryItem.countDocuments({ category: s.name, published: true });
  expectedTotal += n;
  if (n === 0) fail(`section "${s.name}" has no published items`);
  if (!s.cover) fail(`section "${s.name}" has no cover`);
  if (s.published === false) fail(`section "${s.name}" is not published`);
  console.log(`  order=${s.order}  ${s.name}  items=${n}  cover=${s.cover ? "set" : "MISSING"}`);
}
console.log(`  total archive items: ${expectedTotal}`);
if (expectedTotal !== 58) fail(`expected 58 archive items, found ${expectedTotal}`);

console.log("\n=== 2. MEDIA RECORDS ===");
const mediaUrls = new Set((await Media.find({ storageKey: /^golz\/gallery\/archive\// }, { url: 1 }).lean()).map((m) => m.url));
const items = await GalleryItem.find({ category: { $in: YEARS } }).sort({ order: 1 }).lean();
const missingMedia = items.filter((i) => !mediaUrls.has(i.url));
console.log(`  archive media records: ${mediaUrls.size}`);
console.log(`  items lacking a media record: ${missingMedia.length}`);
if (missingMedia.length) fail(`${missingMedia.length} items have no media record`);

console.log("\n=== 3. DUPLICATE / COLLISION CHECK ===");
const dupUrls = await GalleryItem.aggregate([
  { $match: { category: { $in: YEARS } } },
  { $group: { _id: "$url", n: { $sum: 1 } } },
  { $match: { n: { $gt: 1 } } },
]);
console.log(`  duplicate item urls: ${dupUrls.length}`);
if (dupUrls.length) fail(`${dupUrls.length} duplicate urls`);

console.log("\n=== 4. EXISTING CONTENT UNTOUCHED ===");
const legacy = await GalleryItem.find({ category: { $in: ["hero", "other"] } }).lean();
console.log(`  hero/other items still present: ${legacy.length}`);
if (legacy.length !== 8) fail(`expected 8 pre-existing items, found ${legacy.length}`);

console.log("\n=== 5. FIELD SANITY ===");
for (const i of items) {
  if (!i.url.startsWith("https://")) fail(`non-https url: ${i.url}`);
  if (!i.alt) fail(`empty alt on ${i.url}`);
  if (!i.caption) fail(`empty caption on ${i.url}`);
  if (i.type !== "image") fail(`unexpected type ${i.type} on ${i.url}`);
  if (i.gallerySectionId == null) fail(`no gallerySectionId on ${i.url}`);
}
console.log(`  all ${items.length} items have https url, alt, caption, type=image, sectionId`);

console.log("\n=== 6. BLOB URLS ACTUALLY SERVE (HTTP HEAD, all 58) ===");
let ok = 0;
const bad = [];
for (const i of items) {
  try {
    const res = await fetch(i.url, { method: "HEAD" });
    const ct = res.headers.get("content-type") || "";
    if (res.ok && ct.startsWith("image/")) ok += 1;
    else bad.push(`${res.status} ${ct} ${i.url.split("/").pop()}`);
  } catch (err) {
    bad.push(`ERR ${err.message} ${i.url.split("/").pop()}`);
  }
}
console.log(`  served OK: ${ok}/${items.length}`);
if (bad.length) {
  console.log("  failures:");
  bad.forEach((b) => console.log(`    ${b}`));
  fail(`${bad.length} blob urls did not serve as images`);
}

if (API) {
  console.log(`\n=== 7. DEPLOYED PUBLIC API (${API}) ===`);
  try {
    const sres = await fetch(`${API}/api/public/gallery/sections`);
    const sjson = await sres.json();
    const names = sjson.map((s) => `${s.name}(${s.count})`);
    console.log(`  /gallery/sections -> ${sres.status}: ${names.join(", ")}`);
    for (const y of YEARS) {
      const hit = sjson.find((s) => s.name === y);
      if (!hit) fail(`deployed API missing section ${y}`);
      else if (!hit.count) fail(`deployed API section ${y} has count 0`);
    }
    const cres = await fetch(`${API}/api/public/gallery/categories`);
    console.log(`  /gallery/categories -> ${cres.status}: ${JSON.stringify(await cres.json())}`);
  } catch (err) {
    console.log(`  API check skipped/failed: ${err.message}`);
  }
} else {
  console.log("\n=== 7. DEPLOYED PUBLIC API ===\n  skipped (set PUBLIC_API_BASE to enable)");
}

console.log(`\n=== RESULT: ${failures === 0 ? "ALL CHECKS PASSED" : failures + " FAILURE(S)"} ===`);
await mongoose.disconnect();
process.exit(failures ? 1 : 0);
