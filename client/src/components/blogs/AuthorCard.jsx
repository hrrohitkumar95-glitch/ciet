/** Author bio card shown at the end of every article. */
export default function AuthorCard({ author }) {
  const name = author?.trim() || "Dr. Sushma Appaiah";
  const initial = name.charAt(0).toUpperCase();

  return (
    <section className="mt-8 flex items-center gap-5 rounded-[24px] border border-line bg-white p-6 sm:p-7" aria-label="About the author">
      <span
        aria-hidden="true"
        className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary font-heading text-2xl font-semibold text-white"
      >
        {initial}
      </span>

      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">Written by</p>
        <p className="mt-1 font-heading text-lg font-semibold text-ink">{name}</p>
        <p className="mt-1.5 text-sm leading-relaxed text-muted">
          Clinical nutritionist helping real people achieve real, lasting health through evidence-based nutrition.
        </p>
      </div>
    </section>
  );
}
