import { Search, X } from "lucide-react";

/**
 * Search field for the blog listing.
 *
 * Matching runs in the browser over the articles already on screen, so typing
 * never issues a request; the count is announced politely for screen readers.
 */
export default function BlogSearch({ value, onChange, resultCount, loading = false }) {
  return (
    <div className="mx-auto w-full max-w-2xl">
      <label htmlFor="blog-search" className="sr-only">
        Search articles
      </label>
      <div className="relative">
        <Search size={18} className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          id="blog-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search articles…"
          autoComplete="off"
          className="w-full rounded-full border border-line bg-white py-4 pl-12 pr-12 text-base text-ink shadow-soft outline-none transition placeholder:text-muted/60 focus:border-primary focus:ring-4 focus:ring-primary/10"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange("")}
            aria-label="Clear search"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1.5 text-muted transition hover:bg-sage hover:text-ink focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20"
          >
            <X size={16} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <p className="mt-3 text-center text-sm text-muted" aria-live="polite">
        {loading ? "Loading articles…" : `${resultCount} ${resultCount === 1 ? "article" : "articles"}`}
      </p>
    </div>
  );
}