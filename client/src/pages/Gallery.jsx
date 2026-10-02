import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { CalendarCheck, MessageCircle } from "lucide-react";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import Lightbox from "../components/Lightbox";
import GalleryHero from "../components/gallery/GalleryHero";
import GalleryFilters from "../components/gallery/GalleryFilters";
import GalleryGrid from "../components/gallery/GalleryGrid";
import GalleryNotice from "../components/gallery/GalleryNotice";
import GalleryEmptyState from "../components/gallery/GalleryEmptyState";
import { LOADING_BUDGET_MS, loadGallery, loadFallbackItems } from "../gallery/galleryApi";
import { eventTypesIn } from "../gallery/eventTypes";

const SEO_TITLE = "Gallery | GOLZ \u2013 Giggles of Livez";
const SEO_DESCRIPTION =
  "Browse the GOLZ Nutrition gallery from Mysuru: photographs from nutrition workshops, awareness talks, conferences, hospital and institution visits, community events and life at our diet clinic.";

const CANONICAL = typeof window !== "undefined" ? `${window.location.origin}/gallery` : "";

export default function Gallery() {
  const [items, setItems] = useState(null);
  const [sections, setSections] = useState([]);
  const [live, setLive] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [section, setSection] = useState("All");
  const [type, setType] = useState("All");
  const [attempt, setAttempt] = useState(0);
  const [viewer, setViewer] = useState(null);

  useEffect(() => {
    let alive = true;
    setItems(null);
    setLive(false);
    setRetrying(true);

    loadGallery().then(({ items: loaded, sections: loadedSections, source: origin, error }) => {
      if (!alive) return;
      setRetrying(false);
      setItems(loaded);
      setSections(loadedSections);
      setLive(origin === "api");
      if (error) console.error("[gallery] live gallery unavailable, using bundled snapshot:", error.message);
    });

    /* Skeletons run once at most: if the API stays silent past the budget we
       swap in the bundled snapshot rather than spinning forever. */
    const budget = setTimeout(async () => {
      if (!alive) return;
      const snapshot = await loadFallbackItems();
      if (!alive) return;
      setItems((current) => current ?? snapshot);
      setSections((current) =>
        current.length
          ? current
          : [...new Set(snapshot.map((i) => i.section))]
              .sort()
              .map((name, index) => ({
                name,
                title: name,
                order: index + 1,
                published: true,
                count: snapshot.filter((i) => i.section === name).length,
              }))
      );
    }, LOADING_BUDGET_MS);

    return () => {
      alive = false;
      clearTimeout(budget);
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  const visibleSections = useMemo(() => sections.filter((s) => s.published !== false), [sections]);

  const types = useMemo(() => (items?.length ? eventTypesIn(items) : []), [items]);

  /* Section and type are independent axes, so the two filter rows combine. */
  const filtered = useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const bySection = section === "All" || item.section === section;
      const byType =
        type === "All" ||
        (() => {
          const haystack = `${item.eventName ?? ""} ${item.caption ?? ""}`;
          return eventTypesIn([item])[0]?.key === type;
        })();
      return bySection && byType;
    });
  }, [items, section, type]);

  const loading = items === null;
  const isEmpty = !loading && items.length === 0;
  /* `live` tracks what is actually on screen, not what the request returned, so
     the notice appears the moment the bundled snapshot is shown. */
  const showNotice = !loading && !isEmpty && !live;

  const stats = useMemo(() => {
    if (loading || !items.length) return [];
    const years = new Set(items.map((i) => i.year).filter(Boolean));
    const events = new Set(items.map((i) => i.eventName).filter(Boolean));
    return [
      { value: items.length, label: "Photographs" },
      { value: events.size, label: "Events documented" },
      { value: years.size, label: "Years archived" },
      { value: sections.length, label: "Collections" },
    ];
  }, [items, sections.length, loading]);

  const openViewer = useCallback((index) => setViewer({ items: filtered, index }), [filtered]);
  const navigate = useCallback((index) => setViewer((v) => (v ? { ...v, index } : v)), []);

  /* A real photo from the archive, so the social card shows the actual gallery
     instead of an empty tag. Falls back to leaving the tag unset. */
  const ogImage = useMemo(() => items?.find((i) => i.type === "image" && i.image)?.image, [items]);

  return (
    <>
      <SEO
        fullTitle={SEO_TITLE}
        title="Gallery"
        description={SEO_DESCRIPTION}
        image={ogImage}
        keywords="nutrition gallery Mysuru, nutrition workshop photos, awareness talk, conference, hospital visit, diet clinic Mysuru, GOLZ Nutrition events"
        canonical={CANONICAL}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ImageGallery",
          name: "GOLZ Nutrition Gallery",
          description: SEO_DESCRIPTION,
          url: CANONICAL,
        }}
      />

      <GalleryHero stats={stats} />

      {/* ============ GALLERY ============ */}
      <section className="bg-paper section-pad" aria-labelledby="gallery-heading">
        <div className="container-x">
          <div className="flex flex-col gap-4 border-b border-line pb-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-limeDark">Our Archive</span>
              <h2
                id="gallery-heading"
                className="mt-3 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[42px] lg:leading-[1.12]"
              >
                {loading
                  ? "Loading the archive"
                  : isEmpty
                    ? "Nothing to show yet"
                    : `${filtered.length} ${filtered.length === 1 ? "photograph" : "photographs"}`}
              </h2>
            </div>

            {!loading && !isEmpty ? (
              <p className="max-w-md text-sm leading-relaxed text-muted">
                Real moments from our workshops, talks, hospital programmes and community events. Select any photo to
                view it full size.
              </p>
            ) : null}
          </div>

          {isEmpty ? (
            <GalleryEmptyState />
          ) : (
            <>
              <div className="mt-8">
                <GalleryFilters
                  sections={visibleSections}
                  types={types}
                  section={section}
                  type={type}
                  counts={{ total: items?.length ?? 0 }}
                  onSection={setSection}
                  onType={setType}
                />
              </div>

              <div className="mt-10">
                {showNotice ? <GalleryNotice onRetry={retry} busy={retrying} /> : null}

                <GalleryGrid items={filtered} loading={loading} onOpen={openViewer} />

                {!loading && filtered.length === 0 ? (
                  <div className="mt-10 rounded-[22px] border border-line bg-white px-6 py-14 text-center">
                    <p className="font-heading text-lg font-semibold text-ink">No photos match this combination</p>
                    <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                      Try another year or a different event type.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSection("All");
                        setType("All");
                      }}
                      className="btn-outline mt-6"
                    >
                      Clear filters
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ============ MOMENTS FROM GOLZ ============ */}
      {!isEmpty ? (
        <section className="bg-section-sage section-pad">
          <div className="container-x">
            <Reveal className="mx-auto max-w-3xl text-center">
              <span className="mb-5 inline-flex items-center rounded-full border border-primary/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
                Moments from GOLZ
              </span>
              <h2 className="font-heading text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
                Moments from the GOLZ archive
              </h2>
              <p className="mx-auto mt-5 max-w-[640px] text-base leading-[1.8] text-muted sm:text-lg">
                From hands-on nutrition workshops and awareness talks to conferences, hospital visits and events &mdash; a
                window into how science-backed nutrition comes alive.
              </p>
            </Reveal>

            <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
              {[
                { title: "Evidence first", text: "Every plan starts with labs, history and medication &mdash; not guesswork." },
                { title: "Real people", text: "Plans shaped around your work, family, culture and what you actually enjoy eating." },
                { title: "Built to last", text: "Sustainable habits, not crash diets. Progress you can keep after the plan ends." },
                { title: "One nutritionist", text: "The same person follows you through, adjusting as your body responds." },
              ].map((point, i) => (
                <Reveal key={point.title} delay={i * 0.07}>
                  <div className="h-full rounded-[22px] border border-line bg-white p-7 shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-lift motion-reduce:transform-none">
                    <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-sage text-primary">
                      <span className="font-heading text-lg font-bold">{String(i + 1).padStart(2, "0")}</span>
                    </span>
                    <h3 className="mt-5 font-heading text-lg font-semibold text-ink">{point.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{point.text}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-primary section-pad">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(163,198,68,0.1) 0%, transparent 50%)",
          }}
          aria-hidden="true"
        />

        <div className="container-x relative z-10 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-semibold leading-tight text-[#EEF3EA] sm:text-5xl">
              Ready to Start Your Healthy Journey?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#DBE6D5]/80">
              Personalized, science-backed nutrition plans &mdash; built around you, your body and your goals.
            </p>

            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact" className="btn-lime w-full transition-transform duration-300 ease-out hover:scale-[1.02] sm:w-auto">
                <CalendarCheck size={18} aria-hidden="true" />
                Book Consultation
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 font-body text-[15px] font-semibold text-[#EEF3EA] backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-lime hover:text-lime sm:w-auto"
              >
                <MessageCircle size={18} aria-hidden="true" />
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {viewer ? (
          <Lightbox
            items={viewer.items}
            index={viewer.index}
            onClose={() => setViewer(null)}
            onNavigate={navigate}
          />
        ) : null}
      </AnimatePresence>
    </>
  );
}
