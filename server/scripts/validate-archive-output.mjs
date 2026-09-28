/**
 * Validates the optimised archive output: every file must be a decodable JPEG
 * with sane dimensions, and every manifest row must exist with a matching size.
 * Also reports source EXIF orientation so we can confirm .rotate() was needed.
 */
import fs from "fs";
import os from "os";
import path from "path";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const sharp = require("sharp");

const OUT = path.join(os.tmpdir(), "golz-archive-optimised");
const REPO = path.resolve(process.cwd());
const manifest = JSON.parse(fs.readFileSync(path.join(OUT, "manifest.json"), "utf8"));

let bad = 0;
const orientations = new Set();

for (const m of manifest) {
  const p = path.join(OUT, m.year, m.file);
  try {
    const stat = fs.statSync(p);
    const meta = await sharp(p).metadata();
    const srcPath = path.join(REPO, "public", m.original);
    const srcMeta = await sharp(srcPath, { failOn: "none" }).metadata();
    orientations.add(srcMeta.orientation || 1);
    const problems = [];
    if (meta.format !== "jpeg") problems.push(`format=${meta.format}`);
    if (meta.width < 400 || meta.height < 400) problems.push(`too small ${meta.width}x${meta.height}`);
    if (stat.size !== m.bytes) problems.push(`size mismatch ${stat.size} != ${m.bytes}`);
    if (meta.width !== m.width || meta.height !== m.height) problems.push("manifest dim mismatch");
    if (!m.caption) problems.push("empty caption");
    if (!m.alt) problems.push("empty alt");
    if (problems.length) {
      bad++;
      console.log(`BAD  ${m.year}/${m.file}: ${problems.join("; ")}`);
    }
  } catch (err) {
    bad++;
    console.log(`BAD  ${m.year}/${m.file}: unreadable - ${err.message}`);
  }
}

const events = [...new Set(manifest.map((m) => `${m.year} | ${m.event}`))].sort();
console.log("=== VALIDATION ===");
console.log("images checked :", manifest.length);
console.log("problems       :", bad);
console.log("source EXIF orientation values seen:", [...orientations].sort((a, b) => a - b).join(", "));
console.log("\n=== EVENTS PER SECTION (captions) ===");
for (const e of events) {
  const n = manifest.filter((m) => `${m.year} | ${m.event}` === e).length;
  console.log(`${String(n).padStart(2)}  ${e}`);
}
console.log("\nper-year totals:");
for (const y of [...new Set(manifest.map((m) => m.year))].sort()) {
  console.log(`  ${y}: ${manifest.filter((m) => m.year === y).length} images`);
}
process.exit(bad ? 1 : 0);
