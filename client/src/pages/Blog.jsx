import { useEffect, useState, useCallback } from "react";
import { Search, TrendingUp, Clock, ArrowRight, X } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import BlogCard from "../components/BlogCard";
import PageLoader from "../components/PageLoader";
import { formatDate } from "../utils/helpers";

export default function Blog() {
  const [data, setData] = useState(null);
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("All");
  const [page, setPage] = useState(1);
  const [popular, setPopular] = useState([]);

  const load = useCallback(async (q, cat, pg) => {
    setData(null);
    const params = { page: pg, limit: 6 };
    if (q) params.search = q;
    if (cat && cat !== "All") params.category = cat;
    try {
      const { data: res } = await api.get("/public/blogs", { params });
      setData(res);
    } catch {
      setData({ items: [], total: 0, pages: 0, categories: [], tags: [] });
    }
  }, []);

  useEffect(() => {
    load(searchInput, category, page);
  }, [load, searchInput, category, page]);

  useEffect(() => {
    api.get("/public/blogs", { params: { sort: "popular", limit: 4 } }).then(({ data }) => setPopular(data.items));
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      setSearchInput(query);
      setPage(1);
    }, 450);
    return () => clearTimeout(t);
  }, [query]);

  return (
    <>
      <SEO
        title="Blog"
        description="Evidence-based nutrition articles on weight loss, PCOS, diabetes, pregnancy and healthy living."
        keywords="nutrition blog, diet articles, healthy eating, weight loss tips"
      />
      <PageHero
        title="Nutrition Insights"
        subtitle="Practical, science-backed articles to help you eat smarter and live healthier."
        breadcrumb={["Blog"]}
      />

      <section className="section-pad">
        <div className="container-x">
          <div className="mb-10 flex flex-col items-center gap-5">
            <div className="relative w-full max-w-xl">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search articles…"
                aria-label="Search articles"
                className="input !rounded-full !py-3.5 !pl-11"
              />
              {query && (
                <button onClick={() => setQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal" aria-label="Clear search">
                  <X size={16} />
                </button>
              )}
            </div>
            <div className="flex flex-wrap justify-center gap-2.5">
              <button onClick={() => { setCategory("All"); setPage(1); }} className={`chip ${category === "All" ? "chip-active" : ""}`}>All</button>
              {(data?.categories || []).map((c) => (
                <button key={c} onClick={() => { setCategory(c); setPage(1); }} className={`chip ${category === c ? "chip-active" : ""}`}>{c}</button>
              ))}
            </div>
          </div>

          <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
            <div>
              {!data ? (
                <PageLoader label="Loading articles…" />
              ) : data.items.length === 0 ? (
                <p className="py-24 text-center text-charcoal/50">No articles found. Try a different search.</p>
              ) : (
                <div className="grid gap-7 sm:grid-cols-2">
                  {data.items.map((b, i) => <BlogCard key={b._id} blog={b} index={i} />)}
                </div>
              )}

              {data && data.pages > 1 && (
                <div className="mt-12 flex items-center justify-center gap-2">
                  {Array.from({ length: data.pages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      aria-label={`Page ${p}`}
                      className={`h-10 w-10 rounded-full font-heading text-sm font-semibold transition ${p === page ? "bg-primary text-white shadow-soft" : "bg-primary/5 text-charcoal/60 hover:bg-primary/15"}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <aside className="space-y-8 lg:sticky lg:top-28 lg:self-start">
              <div className="card p-6">
                <h2 className="mb-5 flex items-center gap-2 font-heading text-lg font-semibold text-charcoal">
                  <TrendingUp size={19} className="text-primary" /> Popular Posts
                </h2>
                <ul className="space-y-5">
                  {popular.map((b) => (
                    <li key={b._id}>
                      <a href={`/blog/${b.slug}`} className="group flex gap-3">
                        <img src={b.cover} alt="" className="h-16 w-20 shrink-0 rounded-xl object-cover" loading="lazy" />
                        <div>
                          <p className="line-clamp-2 text-sm font-medium leading-snug text-charcoal transition group-hover:text-primary">{b.title}</p>
                          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-charcoal/45"><Clock size={11} /> {formatDate(b.publishedAt || b.createdAt)}</p>
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-3xl bg-gradient-to-br from-primary to-primary-dark p-7 text-white shadow-lift">
                <h2 className="mb-2 font-heading text-xl font-bold">Ready for a change?</h2>
                <p className="mb-5 text-sm text-white/80">Get a personalised plan built around your goals.</p>
                <a href="/contact" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 font-heading text-sm font-semibold text-primary transition hover:bg-sage">
                  Book Consultation <ArrowRight size={15} />
                </a>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
