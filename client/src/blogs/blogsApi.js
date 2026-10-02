import api from "../api/client";
import { stripHtml } from "../utils/helpers";
import BLOG_FALLBACK, { BLOG_FALLBACK_CATEGORIES } from "../data/blogsFallback";

/**
 * Blog data layer.
 *
 * The public blog is local-first. `data/blogsFallback.js` is a generated,
 * read-only snapshot of the published articles, so the listing is available
 * synchronously at first paint: there is no spinner, no empty flash and no
 * dependency on a network request that might be cold, slow or failing. A
 * visitor is never told the blog failed, because the blog cannot fail to load.
 *
 * The CMS is still the source of truth. When `/public/blogs` answers, its
 * response replaces the snapshot so admin edits appear immediately; when it
 * does not, the page simply keeps rendering the snapshot. Neither path shows an
 * error, a retry button or an offline banner, because from a visitor's point of
 * view there is nothing to recover from.
 *
 * Everything below is defensive on purpose:
 *  - the payload is accepted as `{ items }`, `{ posts }`, `{ data }` or a bare
 *    array, because an API returning a different envelope must not silently
 *    empty the page;
 *  - a malformed entry is dropped instead of reaching a card that renders `undefined`;
 *  - categories fall back to the ones present in the articles, so the filter
 *    still works if the endpoint stops sending them.
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

/**
 * The bundled articles, normalised once.
 *
 * This is what the page renders on its very first frame. It is exported so the
 * UI can show real articles before any request has been made.
 */
export const LOCAL_POSTS = BLOG_FALLBACK.map(normalizePost)
  .filter(Boolean)
  .sort(byNewest);

export const LOCAL_CATEGORIES = uniqueStrings(
  BLOG_FALLBACK_CATEGORIES.length ? BLOG_FALLBACK_CATEGORIES : LOCAL_POSTS.map((post) => post.category)
);

/** The listing exactly as it should appear before — and without — the CMS call. */
export function localListing() {
  return { ok: true, posts: LOCAL_POSTS, categories: LOCAL_CATEGORIES, error: null, source: "local" };
}

/** Looks an article up in the snapshot, so a slug always resolves offline. */
export function localPost(slug) {
  return LOCAL_POSTS.find((post) => post.slug === slug) || null;
}

/** Related articles from the snapshot, preferring the same category. */
export function localRelated(slug) {
  const current = localPost(slug);
  const sameCategory = LOCAL_POSTS.filter(
    (post) => post.slug !== slug && (!current || post.category === current.category)
  );
  const others = LOCAL_POSTS.filter((post) => post.slug !== slug);
  return (sameCategory.length ? sameCategory : others).slice(0, 3);
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
 * Refreshes the article list from the CMS.
 *
 * Always resolves with a usable listing. If the CMS answers, its records are
 * used so admin edits appear at once; if it does not, the bundled snapshot is
 * returned instead. There is no failure state to render, because the page can
 * always show real articles.
 */
export async function fetchBlogs({ limit = 100, retries = 1 } = {}) {
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const { data } = await api.get("/public/blogs", {
        params: { limit, sort: "latest" },
        timeout: REQUEST_TIMEOUT,
      });

      const { list, ok: readable } = extractCollection(data);
      if (!readable) throw Object.assign(new Error("Unrecognised response shape"), { shapeMismatch: true });

      const posts = list.map(normalizePost).filter(Boolean).sort(byNewest);
      /* An empty or unusable response must not replace a good snapshot. */
      if (!posts.length) throw new Error("CMS returned no usable articles");

      const fromApi = toArray(data?.categories).map((c) => String(c || "").trim());
      /* Fall back to the categories actually present, otherwise the filter row
         would be empty while articles are on screen. */
      const categories = uniqueStrings(fromApi.length ? fromApi : posts.map((post) => post.category));

      return { ok: true, posts, categories, error: null, source: "cms" };
    } catch (err) {
      const status = err?.response?.status;
      /* A 4xx other than a timeout will not fix itself, so retrying only wastes
         the visitor's time. */
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) break;
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS * (attempt + 1)));
      }
    }
  }

  /* Kept as a developer signal only. Nothing is shown to the visitor: the page
     is already rendering the bundled articles. */
  console.warn("[blogs] CMS list unavailable, serving the bundled articles.");
  return localListing();
}

/**
 * Reads one article.
 *
 * The CMS is preferred so edits and view counts stay live, but a slug always
 * resolves: if the request fails the bundled copy is used, and only a slug that
 * exists in neither is reported as missing.
 */
export async function fetchBlogBySlug(slug) {
  try {
    const { data } = await api.get(`/public/blogs/${encodeURIComponent(slug)}`, { timeout: REQUEST_TIMEOUT });
    const post = normalizePost(data);
    if (post) return { ok: true, post, error: null, source: "cms" };
  } catch (err) {
    if (err?.response?.status === 404) {
      const bundled = localPost(slug);
      /* A slug the CMS deleted but the snapshot still holds is still a real
         article, so it keeps working. */
      if (bundled) return { ok: true, post: bundled, error: null, source: "local" };
      return { ok: false, post: null, notFound: true, error: null };
    }
    const bundled = localPost(slug);
    if (bundled) return { ok: true, post: bundled, error: null, source: "local" };
    return { ok: false, post: null, notFound: false, error: new Error("unavailable") };
  }
  const bundled = localPost(slug);
  if (bundled) return { ok: true, post: bundled, error: null, source: "local" };
  return { ok: false, post: null, notFound: true, error: null };
}

/** Related articles are a nice-to-have: a failure must not break the article. */
export async function fetchRelated(slug) {
  try {
    const { data } = await api.get(`/public/blogs/${encodeURIComponent(slug)}/related`, { timeout: REQUEST_TIMEOUT });
    const fromApi = toArray(data).map(normalizePost).filter(Boolean).slice(0, 3);
    if (fromApi.length) return fromApi;
  } catch {
    /* fall through to the snapshot */
  }
  return localRelated(slug);
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
 * Local GOLZ covers point at the 1600px archive derivative, whose 800px sibling
 * sits beside it under the same name, so a card can paint from the smaller file.
 * A remote cover keeps the resizing-CDN path when the host supports it and is
 * otherwise passed through untouched, because rewriting an unknown URL's query
 * string would break it.
 */
const LOCAL_DERIVATIVE = /^(.*\/[^/]+)-1600\.webp$/;

export function coverAt(cover, width) {
  if (!cover) return "";
  if (/^https?:\/\//i.test(cover) && !/images\.unsplash\.com/i.test(cover)) return cover;

  const local = LOCAL_DERIVATIVE.exec(cover);
  if (local && width <= 800) return `${local[1]}-800.webp`;

  if (/images\.unsplash\.com/i.test(cover)) {
    try {
      const url = new URL(cover);
      url.searchParams.set("w", String(width));
      url.searchParams.set("q", "70");
      return url.toString();
    } catch {
      return cover;
    }
  }
  return cover;
}

export function coverSrcSet(cover) {
  if (!cover) return undefined;
  if (/images\.unsplash\.com/i.test(cover)) {
    return WIDTHS.map((width) => `${coverAt(cover, width)} ${width}w`).join(", ");
  }
  const local = LOCAL_DERIVATIVE.exec(cover);
  if (!local) return undefined;
  return `${local[1]}-800.webp 800w, ${cover} 1600w`;
}
