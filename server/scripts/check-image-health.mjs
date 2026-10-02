import "dotenv/config";
import mongoose from "mongoose";
import GalleryItem from "../src/models/GalleryItem.js";

await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 15000 });
const items = await GalleryItem.find({ published: true }).sort({ category: 1, order: 1 }).lean();
await mongoose.disconnect();

const bad = [];
let i = 0;
for (const it of items) {
  i++;
  let status = "?";
  try {
    const res = await fetch(it.url, { method: "HEAD", signal: AbortSignal.timeout(30000) });
    status = res.status;
    if (!res.ok) bad.push({ n: i, status, section: it.category, event: it.eventName, url: it.url });
  } catch (e) {
    bad.push({ n: i, status: `ERR ${e.message}`, section: it.category, event: it.eventName, url: it.url });
  }
  if (i % 10 === 0) process.stdout.write(`  checked ${i}/${items.length}\n`);
}

console.log(`\nchecked ${items.length} images`);
if (bad.length === 0) console.log("ALL IMAGES OK");
for (const b of bad) console.log(`  #${b.n} status=${b.status} section=${b.section} event="${b.event}"\n     ${b.url}`);
