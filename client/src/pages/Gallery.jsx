import { useEffect, useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronRight, CalendarCheck } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import PageLoader from "../components/PageLoader";
import Lightbox, { PlayBadge } from "../components/Lightbox";
import LazyImage from "../components/LazyImage";
import ImgFallback from "../components/ImgFallback";
import Counter from "../components/Counter";
import { useSite } from "../context/SiteContext";

const PAGE_SIZE = 12;

const STATS = [
  { icon: "⭐", value: 500, suffix: "+", label: "Happy Clients" },
  { icon: "🥗", value: 1200, suffix: "+", label: "Meal Plans" },
  { icon: "📸", value: 100, suffix: "+", label: "Workshops" },
  { icon: "🏆", value: 10, suffix: "+", label: "Years Experience" },
];

const CTA_TEXT = { title: "Ready to Start Your Healthy Journey?", subtitle: "Personalized, science-backed nutrition plans — built around you, your body and your goals." };

export default function Gallery() {
  const { site } = useSite();
  const [items, setItems] = useState([]);
  const [category, setCategory] = useState("All");
  const [sections, setSections] = useState([]);
  const [categories, setCategories] = useState(["All"]);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  const load = useCallback(async (cat, pg, lim = PAGE_SIZE) => {
    setLoading(true);
    try {
      const { data } = await api.get("/public/gallery", { params: { category: cat, page: pg, limit: lim } });
      setItems((prev) => (pg === 1 ? data.items : [...prev, ...data.items]));
      setPages(data.pages);
      setTotal(data.total);
    } catch {
      setItems([]);
      setPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    api.get("/public/gallery/sections").then(({ data }) => setSections(data));
    api.get("/public/gallery/categories").then(({ data }) => setCategories(["All", ...data]));
  }, []);

  useEffect(() => {
    setPage(1);
    load(category, 1, category === "All" ? 1000 : PAGE_SIZE);
  }, [category, load]);

  const sectionByName = useMemo(() => Object.fromEntries(sections.map((s) => [s.name, s])), [sections]);

  const secInfo = useCallback((cat, list) => sectionByName[cat] || { name: cat, title: cat, description: "", cover: "", count: list.length }, [sectionByName]);

  const allSectionNames = useMemo(() => new Set(sections.map((s) => s.name)), [sections]);

  const chipList = useMemo(() => {
    const names = sections.filter((s) => s.published !== false).map((s) => s.name);
    const extras = categories.filter((c) => c !== "All" && !allSectionNames.has(c));
    return ["All", ...names, ...extras];
  }, [sections, categories, allSectionNames]);

  const grouped = useMemo(() => {
    const map = new Map();
    for (const it of items) {
      if (!map.has(it.category)) map.set(it.category, []);
      map.get(it.category).push(it);
    }
    const hidden = new Set(sections.filter((s) => s.published === false).map((s) => s.name));
    const order = sections.filter((s) => s.published !== false).map((s) => s.name);
    const extras = [...map.keys()].filter((c) => !hidden.has(c) && !order.includes(c));
    return [...order, ...extras].map((name) => [name, map.get(name) || []]);
  }, [items, sections]);

  const open = useCallback(async (cat, index = 0) => {
    try {
      const { data } = await api.get("/public/gallery", { params: { category: cat, limit: 1000 } });
      if (!data.items.length) return;
      const section = secInfo(cat, data.items);
      setLightbox({ items: data.items.map((it) => ({ ...it, section })), index: Math.min(index, Math.max(data.items.length - 1, 0)) });
    } catch { /* noop */ }
  }, [secInfo]);
  const navigate = useCallback((index) => setLightbox((lb) => (lb ? { ...lb, index } : lb)), []);

  const renderGrid = (list, onOpen) => (
    <motion.div className="columns-1 gap-6 sm:columns-2 lg:columns-3">
      <AnimatePresence>
        {list.map((item, i) => (
          <motion.button
            key={item._id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.4, delay: (i % 6) * 0.05, ease: [0.21, 0.65, 0.36, 1] }}
            onClick={() => onOpen(i)}
            className="group relative mb-6 w-full cursor-pointer overflow-hidden rounded-[20px] break-inside-avoid bg-white text-left shadow-soft transition-shadow duration-300 hover:shadow-lift focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
            aria-label={`Open ${item.type === "video" ? "video" : "image"}: ${item.caption || item.alt || item.category}`}
          >
            <div className="relative overflow-hidden">
              {item.type === "video" ? (
                <>
                  <video src={item.url} muted className="aspect-[4/3] w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110" />
                  <PlayBadge />
                </>
              ) : (
                <LazyImage
                  src={item.url}
                  alt={item.alt || item.caption || "Gallery image"}
                  natural
                  className="w-full"
                  imgClassName="transition-transform duration-700 ease-out group-hover:scale-110"
                />
              )}

              <span className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

              <span className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-primary shadow-card backdrop-blur">
                {item.category}
              </span>

              <span className="absolute inset-x-0 bottom-0 translate-y-3 p-5 text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
                <span className="block font-heading text-lg font-semibold leading-snug">{item.caption || item.alt || "GOLZ moment"}</span>
                <span className="mt-1 block text-xs font-medium text-white/70">GOLZ · {item.category}</span>
              </span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
    </motion.div>
  );

  const sectionHeader = (sec, onOpen, { showPill = true } = {}) => {
    if (!sec) return null;
    return (
      <button
        onClick={onOpen}
        className="group mb-7 flex w-full cursor-pointer items-center gap-4 rounded-2xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
        aria-label={`Open ${sec.title || sec.name}`}
      >
        {sec.cover && <ImgFallback src={sec.cover} alt="" className="h-16 w-24 shrink-0 rounded-2xl object-cover shadow-soft" fallbackClassName="h-16 w-24 shrink-0 rounded-2xl" />}
        <div className="min-w-0 flex-1">
          <h2 className="font-heading text-2xl font-bold tracking-tight text-ink transition-colors group-hover:text-primary">{sec.title || sec.name}</h2>
          {sec.description && <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted sm:text-base">{sec.description}</p>}
        </div>
        {showPill && sec.count > 0 && (
          <span className="shrink-0 rounded-full border border-primary/25 bg-white px-4 py-2 text-sm font-semibold text-primary transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-white">
            View all ({sec.count}) <ChevronRight size={14} className="inline transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
        )}
      </button>
    );
  };

  return (
    <>
      <SEO
        title="Gallery"
        description="Explore healthy recipes, inspiring client transformations, workshops, seminars and moments from the GOLZ nutrition clinic, Mysuru."
        keywords="nutrition gallery, healthy recipes, client transformations, diet clinic photos"
      />

      {/* ================= HERO ================= */}
      <section className="relative overflow-hidden bg-primary">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-darker/80 via-primary/75 to-primary" />
        <div className="absolute -right-24 top-8 h-64 w-64 rounded-full bg-lime/15 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-20 bottom-0 h-56 w-56 rounded-full bg-sage/15 blur-3xl" aria-hidden="true" />

        <div className="container-x relative z-10 flex min-h-[320px] flex-col justify-center py-14 sm:min-h-[340px]">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.21, 0.65, 0.36, 1] }}
            className="max-w-2xl"
          >
            <nav className="mb-5 flex items-center gap-1.5 text-sm text-[#DBE6D5]/70" aria-label="Breadcrumb">
              <Link to="/" className="transition hover:text-lime">Home</Link>
              <ChevronRight size={14} />
              <span className="text-[#EEF3EA]/90">Gallery</span>
            </nav>
            <h1 className="text-4xl font-bold leading-tight text-[#EEF3EA] sm:text-5xl">Glimpse inside world of Golz Nutrition</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-[#DBE6D5]/80">
              Explore healthy recipes, inspiring client transformations, workshops, seminars, and moments from our nutrition clinic.
            </p>
          </motion.div>
        </div>
      </section>

      {/* ================= GALLERY ================= */}
      <section className="bg-paper section-pad">
        <div className="container-x">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5 }}
            className="mb-12 flex flex-wrap items-center justify-center gap-2.5"
            role="tablist"
            aria-label="Gallery categories"
          >
            {chipList.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                role="tab"
                aria-selected={category === c}
                className={`cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30 ${
                  category === c
                    ? "bg-primary text-white shadow-soft"
                    : "border border-primary/25 bg-white text-primary hover:border-primary hover:bg-primary/5"
                }`}
              >
                {c}
                {c === "All" && total > 0 && <span className={`ml-1.5 text-xs ${category === c ? "text-white/70" : "text-primary/60"}`}>({total})</span>}
              </button>
            ))}
          </motion.div>

          {loading && page === 1 ? (
            <PageLoader label="Loading gallery…" />
          ) : category === "All" ? (
            <div className="space-y-16">
              {grouped.map(([cat, list]) => (
                <div key={cat}>
                  {sectionHeader(secInfo(cat, list), () => open(cat, 0))}
                  {list.length === 0 ? (
                    <p className="rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center text-sm text-charcoal/50">
                      No images have been added to this section yet.
                    </p>
                  ) : (
                    <>
                      {renderGrid(list.slice(0, 4), (i) => open(cat, i))}
                      {list.length > 4 && (
                        <div className="mt-7 text-center">
                          <button
                            onClick={() => open(cat, 0)}
                            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/25 bg-white px-6 py-3 text-sm font-semibold text-primary shadow-soft transition-all duration-300 hover:border-primary hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
                          >
                            View all {list.length} {list.length === 1 ? "photo" : "photos"} <ChevronDown size={16} />
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div>
              {sectionHeader(secInfo(category, items), () => open(category, 0), { showPill: false })}
              {renderGrid(items, (i) => open(category, i))}
            </div>
          )}

          {category !== "All" && page < pages && (
            <div className="mt-14 text-center">
              <button
                onClick={() => { const next = page + 1; setPage(next); load(category, next); }}
                disabled={loading}
                className="btn-outline"
              >
                {loading ? "Loading…" : "Load More"} <ChevronDown size={17} />
              </button>
            </div>
          )}

          {!loading && items.length === 0 && (
            <p className="py-20 text-center text-charcoal/50">No images have been added to this section yet.</p>
          )}
        </div>
      </section>

      {/* ================= MOMENTS FROM GOLZ ================= */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="mb-5 inline-flex items-center rounded-full border border-primary/30 bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              Moments from GOLZ
            </span>
            <h2 className="text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              Glimpse inside world of Golz Nutrition
            </h2>
            <p className="mx-auto mt-5 max-w-[600px] text-base leading-[1.8] text-muted sm:text-lg">
              From healthy cooking workshops and awareness seminars to real client transformations and everyday life at the clinic — a window into how science-backed nutrition comes alive.
            </p>
          </Reveal>

          <div className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
            {STATS.map((s, i) => (
              <Reveal key={s.label} delay={i * 0.08}>
                <div className="flex min-h-[170px] flex-col items-center justify-center rounded-[24px] border border-line bg-white p-6 text-center shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <span className="text-3xl" aria-hidden="true">{s.icon}</span>
                  <p className="mt-3 font-heading text-4xl font-bold tracking-tight text-primary sm:text-5xl">
                    <Counter value={s.value} suffix={s.suffix} />
                  </p>
                  <p className="mt-1.5 text-sm font-medium text-muted">{s.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative overflow-hidden bg-primary section-pad">
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.06) 0%, transparent 45%), radial-gradient(circle at 80% 85%, rgba(163,198,68,0.1) 0%, transparent 50%)" }} aria-hidden="true" />
        <div className="pointer-events-none absolute -left-24 top-10 h-64 w-64 rounded-full border border-white/10" aria-hidden="true" />
        <div className="pointer-events-none absolute -right-20 bottom-6 h-72 w-72 rounded-full border border-white/10" aria-hidden="true" />

        <div className="container-x relative z-10 text-center">
          <Reveal>
            <h2 className="mx-auto max-w-2xl font-heading text-4xl font-semibold leading-tight text-[#EEF3EA] sm:text-5xl">
              {CTA_TEXT.title}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-[#DBE6D5]/80">{CTA_TEXT.subtitle}</p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/contact" className="btn-lime w-full transition-transform duration-300 ease-out hover:scale-[1.02] sm:w-auto">
                <CalendarCheck size={18} /> Book Consultation
              </Link>
              <Link
                to="/contact"
                className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 font-body text-[15px] font-semibold text-[#EEF3EA] backdrop-blur transition-all duration-300 ease-out hover:-translate-y-0.5 hover:border-lime hover:text-lime sm:w-auto"
              >
                Contact Us
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <AnimatePresence>
        {lightbox && <Lightbox items={lightbox.items} index={lightbox.index} onClose={() => setLightbox(null)} onNavigate={navigate} />}
      </AnimatePresence>
    </>
  );
}
