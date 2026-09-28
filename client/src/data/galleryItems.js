/**
 * Single source of truth for gallery item shape.
 *
 * Every gallery surface (cards, section headers, lightbox, prev/next navigation)
 * reads from the normalised object produced here, so an image can never lose or
 * swap its own metadata while browsing.
 *
 * Canonical shape:
 *   { id, image, year, eventName, caption }
 *
 * The year / eventName / caption values come from the database (populated by
 * server/scripts/build-gallery-metadata.mjs from the original archive folder
 * and filename layout). No captions are hardcoded in the UI components.
 */

const YEAR_RE = /^\d{4}$/;

const text = (value) => (typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "");

/**
 * Normalise one API record into the canonical gallery item.
 * @param {object} raw GalleryItem document from the API.
 * @param {number} index Fallback position, used only for a stable id.
 */
export function toGalleryItem(raw, index = 0) {
  const section = text(raw.category);
  const year = text(raw.year) || (YEAR_RE.test(section) ? section : "");
  const eventName = text(raw.eventName);
  const caption = text(raw.caption) || text(raw.description);

  return {
    id: raw._id || raw.id || `gallery-item-${index}`,
    image: raw.url || "",
    year,
    eventName,
    caption,
    /**
     * True only when the caption says something the event name does not.
     * Photos whose original filename carried no description reuse the event
     * name, so echoing it as a "caption" would just repeat the heading.
     */
    hasOwnCaption: Boolean(caption) && caption !== eventName,
    type: raw.type === "video" ? "video" : "image",
    section,
    alt: text(raw.alt) || caption || eventName,
  };
}

/** Normalise a list of API records, dropping any record with no media. */
export function toGalleryItems(list) {
  return (list || []).map(toGalleryItem).filter((item) => item.image);
}

/**
 * Items imported before per-photo metadata existed have no eventName of their
 * own, so they fall back to the human title of the section they belong to.
 */
export function withSectionLabel(item, section) {
  if (item.eventName) return item;
  return { ...item, eventName: text(section?.title) || text(section?.name) };
}

/** Apply {@link withSectionLabel} across a list. */
export function withSectionLabels(items, section) {
  return (items || []).map((item) => withSectionLabel(item, section));
}

/** The heading shown on a card and at the top of the lightbox. */
export function titleOf(item) {
  return item?.eventName || item?.year || "Gallery";
}

/** The caption line, or "" when there is nothing new to say. */
export function captionOf(item) {
  return item?.hasOwnCaption ? item.caption : "";
}

/** Human label for the lightbox, e.g. "2015 · AIISH - July 2015". */
export function labelOf(item) {
  if (!item) return "";
  return [item.year, item.eventName].filter(Boolean).join(" · ");
}
