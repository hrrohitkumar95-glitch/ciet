import api from "../api/client";
import { stripHtml } from "../utils/helpers";

/**
 * Blog data layer.
 *
 * The listing used to be read straight off `axios` inside the page, which is
 * what made production look broken: any failed or unexpectedly shaped response
 * collapsed into an empty array, and an empty array is indistinguishable from a
 * genuinely empty blog. The page then rendered "No articles yet." next to a
 * large blank area with no error anywhere.
 *
 * Everything here is defensive on purpose:
 *  - the payload is accepted as `{ items }`, `{ posts }`, `{ data }` or a bare
 *    array, because an API returning a different envelope must not silently
 *    empty the page;
 *  - a malformed entry is dropped instead of reaching a card that renders `undefined`;
 *  - categories fall back to the ones present in the articles, so the filter
 *    still works if the endpoint stops sending them;
 *  - a request is retried once, because a cold serverless start is the most
 *    common cause of a one-off failure and it is not a real error.
 *
 * Nothing here bundles a copy of the articles: the blog is edited from the
 * admin panel, so a snapshot would go stale and could contradict the database.
 */

const REQUEST_TIMEOUT = 12000;
const RETRY_DELAY_MS = 900;

/** A useful listing has a title and something to link to. Anything else is dropped. */
function isUsable(post) {
  return Boolean(post && typeof post === "object" && post.slug && (post.title || post.excerpt || post.content));
}

function toArray(value) {
  if (Array.isArray(value)) return value;
  if (value && typeof value === "object") {
    /* Different envelopes across deployments and services all end up here. */
    for (const key of ["items", "posts", "blogs", "data", "results"]) {
      if (Array.isArray(value[key])) return value[key];
    }
  }
  return [];
}

/**
 * Pulls the article list out of whatever envelope arrived.
 *
 * `ok: false` means the body could not be interpreted at all, which is a
 * different situation from "the blog is empty" and must not be presented as
 * one: a visitor would be told there are no articles when the truth is that
 * the request returned something unexpected.
 */
function extractCollection(data) {
  if (Array.isArray(data)) return { list: data, ok: true };
  if (data && typeof data === "object") {
    for (const key of ["items", "posts", "blogs", "data", "results"]) {
      if (Array.isArray(data[key])) return { list: data[key], ok: true };
    }
  }
  return { list: null, ok: false };
}

function toTags(value) {
  if (Array.isArray(value)) return value.filter(Boolean).map(String);
  if (typeof value === "string") {
    return value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
}

function toDate(value) {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function toCover(value) {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  /* Only absolute URLs and site-relative paths are usable in an <img src>. */
  if (/^(https?:)?\/\//i.test(trimmed) || trimmed.startsWith("/")) return trimmed;
  return `/${trimmed.replace(/^\.?\//, "")}`;
}

/** Flattens a raw document into the exact fields the UI reads, so no card has to defend itself. */
export function normalizePost(raw) {
  if (!isUsable(raw)) return null;
  const slug = String(raw.slug).trim();
  const title = String(raw.title || "").trim();
  const content = typeof raw.content === "string" ? raw.content : "";

  return {
    id: String(raw._id || raw.id || slug),
    slug,
    url: `/blogs/${slug}`,
    title: title || "Untitled article",
    excerpt: String(raw.excerpt || "").trim(),
    content,
    plainText: stripHtml(content || raw.excerpt || ""),
    category: String(raw.category || "").trim(),
    tags: toTags(raw.tags),
    cover: toCover(raw.cover || raw.image || (Array.isArray(raw.images) ? raw.images[0] : "")),
    author: String(raw.author || "").trim(),
    readingTime: Number.isFinite(Number(raw.readingTime)) && Number(raw.readingTime) > 0 ? Number(raw.readingTime) : null,
    featured: Boolean(raw.featured),
    views: Number.isFinite(Number(raw.views)) ? Number(raw.views) : 0,
    published: Boolean(raw.published),
    publishedAt: toDate(raw.publishedAt),
    createdAt: toDate(raw.createdAt),
    updatedAt: toDate(raw.updatedAt),
  };
}

/** Newest first, with a stable tie-breaker so the order never flickers. */
function byNewest(a, b) {
  const left = a.publishedAt || a.createdAt || "";
  const right = b.publishedAt || b.createdAt || "";
  if (left === right) return a.id.localeCompare(b.id);
  return left < right ? 1 : -1;
}

function uniqueStrings(list) {
  const seen = new Set();
  const out = [];
  for (const value of list) {
    const clean = String(value || "").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}

/**
 * Reads the published articles.
 *
 * Resolves with a result object rather than rejecting, because "the request
 * failed" is a state the page has to render, not an exception it should crash
 * on. `ok: false` means the database could not be reached; `ok: true` with an
 * empty list means there genuinely are no published articles.
 */
export async function fetchBlogs({ limit = 100, retries = 1 } = {}) {
  let lastError = null;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { data } = await api.get("/public/blogs", {
        params: { limit, sort: "latest" },
        timeout: REQUEST_TIMEOUT,
      });

      const { list, ok: readable } = extractCollection(data);
      if (!readable) {
        throw Object.assign(new Error("Unrecognised response shape"), { shapeMismatch: true });
      }

      const posts = list.map(normalizePost).filter(Boolean).sort(byNewest);
      const fromApi = toArray(data?.categories).map((c) => String(c || "").trim());
      /* Fall back to the categories actually present, otherwise the filter row
         would be empty while articles are on screen. */
      const categories = uniqueStrings(fromApi.length ? fromApi : posts.map((post) => post.category));

      return { ok: true, posts, categories, error: null };
    } catch (err) {
      lastError = err;
      const status = err?.response?.status;
      /* A 4xx other than a timeout will not fix itself, so retrying only wastes
         the visitor's time. */
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) break;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  const status = lastError?.response?.status ?? 0;
  const message = lastError?.shapeMismatch
    ? "The articles service returned an unexpected response. Please try again."
    : status === 503
      ? "The content service is briefly unavailable."
      : status
        ? "We could not reach the articles just now."
        : "You appear to be offline.";

  console.error("[blogs] listing request failed:", lastError?.message || "unknown error");
  return { ok: false, posts: [], categories: [], error: new Error(message) };
}

/** Reads one published article. A missing slug is a real 404, not a failure. */
export async function fetchBlogBySlug(slug) {
  try {
    const { data } = await api.get(`/public/blogs/${encodeURIComponent(slug)}`, { timeout: REQUEST_TIMEOUT });
    return { ok: true, post: normalizePost(data), error: null };
  } catch (err) {
    if (err?.response?.status === 404) return { ok: false, post: null, notFound: true, error: null };
    console.error("[blogs] article request failed:", err?.message || "unknown error");
    return { ok: false, post: null, notFound: false, error: new Error("We could not load this article.") };
  }
}

/** Related articles are a nice-to-have: a failure must not break the article. */
export async function fetchRelated(slug) {
  try {
    const { data } = await api.get(`/public/blogs/${encodeURIComponent(slug)}/related`, { timeout: REQUEST_TIMEOUT });
    return toArray(data).map(normalizePost).filter(Boolean).slice(0, 3);
  } catch {
    return [];
  }
}

/**
 * Sidebar ordering.
 *
 * Articles are only called "most read" when the database actually records
 * views; otherwise the list falls back to featured-then-recent and says so,
 * rather than presenting an arbitrary order as a popularity ranking.
 */
export function orderPopular(posts) {
  const tracked = posts.some((post) => post.views > 0);
  if (tracked) {
    return { tracked, posts: [...posts].sort((a, b) => b.views - a.views || byNewest(a, b)) };
  }
  return {
    tracked,
    posts: [...posts].sort((a, b) => Number(b.featured) - Number(a.featured) || byNewest(a, b)),
  };
}

const WIDTHS = [480, 800, 1200];

/**
 * Asks the image host for a smaller copy instead of downloading the original.
 *
 * Blog covers are served by a resizing CDN (Unsplash), so swapping the width
 * parameter is the cheapest real optimisation available: the browser picks a
 * size close to what it renders and the phone never downloads the 1200px file
 * for a 160px card. Any other host is left untouched, because rewriting an
 * unknown URL's query string would break it.
 */
export function coverAt(cover, width) {
  if (!cover) return "";
  if (!/images\.unsplash\.com/i.test(cover)) return cover;
  try {
    const url = new URL(cover);
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", "70");
    return url.toString();
  } catch {
    return cover;
  }
}

export function coverSrcSet(cover) {
  if (!cover || !/images\.unsplash\.com/i.test(cover)) return undefined;
  return WIDTHS.map((width) => `${coverAt(cover, width)} ${width}w`).join(", ");
}