/**
 * Category filters.
 *
 * Sections (years) come straight from the CMS; event types are derived from the
 * real captions. Both groups wrap onto multiple lines rather than scrolling
 * sideways, so the control can never overflow horizontally on a phone.
 */
export default function GalleryFilters({ sections = [], types = [], section, type, counts = {}, onSection, onType }) {
  const sectionChip = (key, label, count) => {
    const active = section === key;
    return (
      <button
        key={key}
        type="button"
        data-filter="section"
        data-value={key}
        onClick={() => onSection(key)}
        aria-pressed={active}
        className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
          active
            ? "bg-primary text-white shadow-soft"
            : "border border-primary/20 bg-white text-primary hover:border-primary/50 hover:bg-primary/5"
        }`}
      >
        {label}
        {Number.isFinite(count) && count > 0 ? (
          <span className={`ml-1.5 text-xs ${active ? "text-white/70" : "text-primary/55"}`}>{count}</span>
        ) : null}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Year</span>
        <div role="group" aria-label="Filter gallery by year" className="flex flex-wrap gap-2.5">
          {sectionChip("All", "All", counts.total)}
          {sections.map((s) => sectionChip(s.name, s.title || s.name, s.count))}
        </div>
      </div>

      {types.length ? (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
          <span className="shrink-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">Type</span>
          <div role="group" aria-label="Filter gallery by event type" className="flex flex-wrap gap-2.5">
            <button
              type="button"
              data-filter="type"
              data-value="All"
              onClick={() => onType("All")}
              aria-pressed={type === "All"}
              className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
                type === "All"
                  ? "bg-lime text-ink shadow-soft"
                  : "border border-primary/20 bg-white text-primary hover:border-primary/50 hover:bg-primary/5"
              }`}
            >
              All types
            </button>
            {types.map((t) => (
              <button
                key={t.key}
                type="button"
                data-filter="type"
                data-value={t.key}
                onClick={() => onType(t.key)}
                aria-pressed={type === t.key}
                title={t.blurb}
                className={`rounded-full px-4 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
                  type === t.key
                    ? "bg-lime text-ink shadow-soft"
                    : "border border-primary/20 bg-white text-primary hover:border-primary/50 hover:bg-primary/5"
                }`}
              >
                {t.key}
                <span className={`ml-1.5 text-xs ${type === t.key ? "text-ink/60" : "text-primary/55"}`}>{t.count}</span>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
