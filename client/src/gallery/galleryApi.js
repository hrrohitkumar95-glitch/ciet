import api from "../api/client";

const REQUEST_TIMEOUT_MS = 9000;
/** Bounded loading: past this the page stops showing skeletons. */
export const LOADING_BUDGET_MS = 6000;

const text = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/**
 * Normalises one API record. Field names are read defensively because the
 * gallery schema (url/thumb/caption/eventName) and older records do not always
 * agree, and a single bad record must never blank the grid.
 */
export function toGalleryItem(raw, index = 0) {
  if (!raw || typeof raw !== "object") return null;

  const url = text(raw.url) || text(raw.image) || text(raw.src);
  if (!url) return null;

  const eventName = text(raw.eventName);
  const caption = text(raw.caption) || text(raw.description);
  const year = text(raw.year) || (/^\d{4}$/.test(raw.category) ? text(raw.category) : "");

  return {
    id: text(raw._id) || text(raw.id) || `gallery-item-${index}`,
    image: url,
    thumb: text(raw.thumb) || url,
    type: raw.type === "video" ? "video" : "image",
    section: text(raw.category) || "General",
    sectionId: text(raw.gallerySectionId),
    year,
    eventName,
    caption,
    /* True only when the caption adds something the title does not say. */
    hasOwnCaption: Boolean(caption) && caption !== eventName,
    alt: text(raw.alt) || caption || eventName || text(raw.category) || "GOLZ nutrition gallery image",
    order: Number.isFinite(raw.order) ? raw.order : index,
  };
}

export function toGalleryItems(list) {
  return (list || []).map(toGalleryItem).filter(Boolean);
}

export const titleOf = (item) => item?.eventName || item?.year || "Gallery";
export const captionOf = (item) => (item?.hasOwnCaption ? item.caption : "");
export const labelOf = (item) => [item?.year, item?.eventName].filter(Boolean).join(" \u00b7 ");

/** Applies a section's human title to items that have no event name of their own. */
export const withSectionLabels = (items, section) =>
  (items || []).map((item) =>
    item.eventName ? item : { ...item, eventName: text(section?.title) || text(section?.name) || item.section }
  );

/**
 * Accepts `{ items }`, `{ gallery }`, a bare array, or null — and always returns
 * an array. Never assumes the response shape.
 */
function extractItems(payload) {
  const candidate = Array.isArray(payload)
    ? payload
    : Array.isArray(payload?.items)
      ? payload.items
      : Array.isArray(payload?.gallery)
        ? payload.gallery
        : Array.isArray(payload?.data)
          ? payload.data
          : null;
  return toGalleryItems(candidate);
}

function extractSections(payload) {
  const raw = Array.isArray(payload?.sections) ? payload.sections : Array.isArray(payload) ? payload : [];
  return raw
    .filter((s) => s && typeof s === "object")
    .map((s) => ({
      name: text(s.name),
      title: text(s.title) || text(s.name),
      description: text(s.description),
      cover: text(s.cover),
      order: Number.isFinite(s.order) ? s.order : 999,
      published: s.published !== false,
      count: Number.isFinite(s.count) ? s.count : 0,
    }))
    .filter((s) => s.name);
}

function extractCategories(payload) {
  const raw = Array.isArray(payload?.categories) ? payload.categories : Array.isArray(payload) ? payload : [];
  return raw.filter((c) => typeof c === "string" && c.trim());
}

/**
 * The bundled snapshot is loaded in parallel with the API request rather than
 * imported statically, so it never lands in the initial bundle but is still
 * ready if the request has to fall back.
 */
let fallbackPromise = null;
export function loadFallbackItems() {
  if (!fallbackPromise) {
    fallbackPromise = import("../data/galleryFallback")
      .then((m) => toGalleryItems(m.default))
      .catch(() => []);
  }
  return fallbackPromise;
}

const withTimeout = (promise) =>
  Promise.race([
    promise,
    new Promise((_resolve, reject) => setTimeout(() => reject(new Error("Request timed out")), REQUEST_TIMEOUT_MS)),
  ]);

async function requestWithRetry(path, attempts = 2) {
  let lastError;
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await withTimeout(api.get(path, { timeout: REQUEST_TIMEOUT_MS }));
    } catch (err) {
      lastError = err;
      if (attempt < attempts) await new Promise((r) => setTimeout(r, 400 * attempt));
    }
  }
  throw lastError;
}

/**
 * Loads the gallery in one request.
 *
 * PRIMARY  : GET /public/gallery — items, sections and categories together.
 * FALLBACK : the bundled snapshot of the same CMS records.
 *
 * Returns items plus the source so the page can show a small notice without
 * ever replacing real content. The fallback never writes to the database.
 */
export async function loadGallery() {
  try {
    const { data } = await requestWithRetry("/public/gallery?page=1&limit=200");

    let items = extractItems(data);
    let sections = extractSections(data);
    let categories = extractCategories(data);

    /* Older deployments may still answer without the bundled metadata. */
    const [sectionPatch, categoryPatch] = await Promise.all([
      sections.length ? Promise.resolve(null) : api.get("/public/gallery/sections").catch(() => null),
      categories.length ? Promise.resolve(null) : api.get("/public/gallery/categories").catch(() => null),
    ]);
    if (sectionPatch) sections = extractSections(sectionPatch.data);
    if (categoryPatch) categories = extractCategories(categoryPatch.data);

    if (!items.length) {
      return {
        items: await loadFallbackItems(),
        sections,
        categories,
        source: "fallback",
        error: new Error("Gallery API returned no usable records"),
      };
    }

    return { items, sections, categories, source: "api", error: null };
  } catch (err) {
    const fallback = await loadFallbackItems();
    /* Derive sections from the snapshot so the filter bar still works offline. */
    const derivedSections = [...new Set(fallback.map((i) => i.section))]
      .sort()
      .map((name, index) => ({
        name,
        title: name,
        description: "",
        cover: "",
        order: index + 1,
        published: true,
        count: fallback.filter((i) => i.section === name).length,
      }));

    return {
      items: fallback,
      sections: derivedSections,
      categories: derivedSections.map((s) => s.name),
      source: "fallback",
      error: err,
    };
  }
}
