import { useEffect } from "react";

function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  if (content) el.setAttribute("content", content);
}

/**
 * Lightweight client-side SEO: title, meta, Open Graph, Twitter and JSON-LD.
 *
 * `fullTitle` sets document.title verbatim — use it when a page needs an exact
 * title (for example "Services | GOLZ – Giggles of Livez"). Otherwise the
 * `title` prop is suffixed with the site name.
 */
export default function SEO({ title, fullTitle, description, image, keywords, jsonLd, canonical, noindex = false }) {
  const siteName = "GOLZ (Giggles of Livez)";

  useEffect(() => {
    document.title = fullTitle || (title ? `${title} | ${siteName}` : siteName);
    upsertMeta("name", "description", description || "");
    upsertMeta("property", "og:title", document.title);
    upsertMeta("property", "og:description", description || "");
    upsertMeta("property", "og:type", "website");
    upsertMeta("property", "og:image", image || "");
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:title", document.title);
    upsertMeta("name", "twitter:description", description || "");
    upsertMeta("name", "keywords", keywords || "");
    /* An error or 404 page must never be indexed as real content. The CMS
       area is excluded regardless of what the page asks for, so an admin route
       can never be published by forgetting a prop. */
    const isAdmin = window.location.pathname.startsWith("/admin");
    upsertMeta("name", "robots", noindex || isAdmin ? "noindex, nofollow" : "index, follow");

    let link = document.head.querySelector('link[rel="canonical"]');
    if (canonical) {
      if (!link) {
        link = document.createElement("link");
        link.rel = "canonical";
        document.head.appendChild(link);
      }
      link.href = canonical;
    } else if (link) {
      link.remove();
    }

    const id = "seo-jsonld";
    document.getElementById(id)?.remove();
    if (jsonLd) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = id;
      script.text = JSON.stringify(jsonLd);
      document.head.appendChild(script);
    }
  }, [title, fullTitle, description, image, keywords, jsonLd, canonical, noindex]);

  return null;
}
