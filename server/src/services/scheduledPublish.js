import Blog from "../models/Blog.js";

/**
 * Scheduled blog publishing without a long-lived process.
 *
 * The in-process cron job only runs on a persistent Node server: on Vercel every
 * instance is short-lived and replicated, so a timer would fire unreliably (and
 * keep instances warm for no reason). Rather than let scheduled posts silently
 * never go live, due posts are published lazily on read.
 *
 * The check is throttled per instance and must never be allowed to delay or
 * fail the request it rides along with, so every error is swallowed and the
 * call is fire-and-forget.
 */
const CHECK_INTERVAL_MS = Number(process.env.SCHEDULED_PUBLISH_CHECK_MS || 60000);

let lastCheck = 0;
let inFlight = false;

export async function publishDueBlogs({ force = false } = {}) {
  const now = Date.now();
  if (inFlight) return 0;
  if (!force && now - lastCheck < CHECK_INTERVAL_MS) return 0;

  inFlight = true;
  lastCheck = now;

  try {
    const due = await Blog.find({
      published: false,
      scheduledAt: { $ne: null, $lte: new Date() },
    });

    for (const blog of due) {
      blog.published = true;
      blog.publishedAt = blog.publishedAt || new Date();
      await blog.save();
      console.log(`[scheduled] published blog: ${blog.title}`);
    }

    return due.length;
  } catch (err) {
    console.error("[scheduled] publish check failed:", err.message);
    return 0;
  } finally {
    inFlight = false;
  }
}