/**
 * Regenerates `client/src/data/blogsFallback.js` from the CMS.
 *
 * Run it after articles are added, edited or unpublished in the admin panel:
 *
 *     node scripts/generate-blogs-fallback.mjs
 *
 * The output is a read-only snapshot. It is never written back to the database
 * and the admin panel stays the source of truth — the file exists only so the
 * public /blogs page can render real articles synchronously, without waiting on
 * a network request that may be cold, slow or failing.
 */
import "dotenv/config";
import mongoose from "mongoose";
import { writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const REPO = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(REPO, "client", "src", "data", "blogsFallback.js");

if (!process.env.MONGO_URI) {
  console.error("[blogs-fallback] MONGO_URI is not set. Nothing was written.");
  process.exit(1);
}

await mongoose.connect(process.env.MONGO_URI);
const docs = await mongoose.connection.db
  .collection("blogs")
  .find({ published: { $ne: false } })
  .toArray();

if (!docs.length) {
  console.error("[blogs-fallback] No published articles found. Nothing was written.");
  await mongoose.disconnect();
  process.exit(1);
}

/** Dates arrive as Date objects or ISO strings depending on the driver path. */
const iso = (value) => {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? "" : date.toISOString();
};

const byNewest = (a, b) => {
  const left = iso(a.publishedAt) || iso(a.createdAt);
  const right = iso(b.publishedAt) || iso(b.createdAt);
  if (left === right) return String(a.slug).localeCompare(String(b.slug));
  return left < right ? 1 : -1;
};

/* Only the fields the public UI reads, so the snapshot cannot leak admin-only
   or internal values into the client bundle. */
const pick = (doc) => ({
  id: String(doc._id),
  title: String(doc.title || "").trim(),
  slug: String(doc.slug || "").trim(),
  excerpt: String(doc.excerpt || "").trim(),
  content: String(doc.content || ""),
  author: String(doc.author || "").trim(),
  cover: String(doc.cover || "").trim(),
  category: String(doc.category || "").trim(),
  tags: Array.isArray(doc.tags) ? doc.tags.filter(Boolean).map(String) : [],
  readingTime: Number(doc.readingTime) > 0 ? Number(doc.readingTime) : 1,
  featured: Boolean(doc.featured),
  views: Number.isFinite(Number(doc.views)) ? Number(doc.views) : 0,
  publishedAt: iso(doc.publishedAt) || iso(doc.createdAt) || null,
  updatedAt: iso(doc.updatedAt) || null,
});

const posts = docs
  .filter((doc) => doc.slug && (doc.title || doc.excerpt || doc.content))
  .map(pick)
  .sort(byNewest);

const categories = [...new Set(posts.map((p) => p.category).filter(Boolean))].sort();

const body = `/**
 * Read-only snapshot of the published GOLZ articles.
 *
 * GENERATED FILE - do not edit by hand. Run:
 *     node scripts/generate-blogs-fallback.mjs
 *
 * This file is NEVER written to the database and never replaces CMS data. It
 * exists purely so /blogs and /blogs/:slug always render real articles, even if
 * the public API is unreachable, slow, failing or returning an unexpected
 * payload. The admin panel remains the single source of truth; regenerate this
 * file after articles are added, edited or unpublished.
 *
 * ${posts.length} published article(s), ${categories.length} categories.
 */

export const BLOG_FALLBACK_CATEGORIES = ${JSON.stringify(categories, null, 2)};

export const BLOG_FALLBACK = ${JSON.stringify(posts, null, 2)};

export default BLOG_FALLBACK;
`;

writeFileSync(OUT, body, "utf8");
console.log(
  `[blogs-fallback] wrote ${posts.length} article(s) and ${categories.length} categories to ${path.relative(REPO, OUT)}`
);
await mongoose.disconnect();
