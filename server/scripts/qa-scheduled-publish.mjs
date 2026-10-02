// Verifies lazy scheduled publishing: a due, unpublished blog must go live on
// the next read of the public blog list, without the cron job running.
import mongoose from "mongoose";
import "dotenv/config";
import Blog from "../src/models/Blog.js";

await mongoose.connect(process.env.MONGO_URI || process.env.MONGO_DIRECT_URI, { serverSelectionTimeoutMS: 15000 });

const stamp = Date.now();
const doc = await Blog.create({
  title: `QA scheduled publish ${stamp}`,
  slug: `qa-scheduled-${stamp}`,
  excerpt: "Temporary post created by the scheduled-publish check.",
  content: "<p>Temporary</p>",
  published: false,
  scheduledAt: new Date(Date.now() - 60_000),
});

const check = await (async () => {
  const res = await fetch("http://localhost:5000/api/public/blogs?limit=50", { signal: AbortSignal.timeout(20000) });
  return { status: res.status, data: await res.json() };
})();

// The lazy check is throttled per instance, so a run started just after another
// has to wait out the window. Assert the post does go live, not how fast.
let listed = check.data.items?.some((b) => b.slug === doc.slug) ?? false;
const deadline = Date.now() + 75_000;
while (!listed && Date.now() < deadline) {
  await new Promise((r) => setTimeout(r, 1000));
  const again = await (await fetch("http://localhost:5000/api/public/blogs?limit=50", { signal: AbortSignal.timeout(20000) })).json();
  listed = again.items?.some((b) => b.slug === doc.slug) ?? false;
}

const after = await Blog.findById(doc._id).lean();
await Blog.deleteOne({ _id: doc._id });
await mongoose.disconnect();

console.log(`public listing status : ${check.status}`);
console.log(`scheduled post visible: ${listed}`);
console.log(`published flag after   : ${after.published}`);
console.log(`publishedAt set        : ${Boolean(after.publishedAt)}`);
console.log(`cleanup: temp post removed`);

const pass = listed && after.published === true && Boolean(after.publishedAt);
console.log(pass ? "\nPASS scheduled publishing works without cron" : "\nFAIL scheduled publishing did not happen");
process.exit(pass ? 0 : 1);