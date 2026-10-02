import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import BlogHero from "../components/blogs/BlogHero";
import BlogSearch from "../components/blogs/BlogSearch";
import BlogCategories from "../components/blogs/BlogCategories";
import BlogFeatured from "../components/blogs/BlogFeatured";
import BlogCard from "../components/blogs/BlogCard";
import BlogGrid from "../components/blogs/BlogGrid";
import BlogSidebar from "../components/blogs/BlogSidebar";
import { fetchBlogs, orderPopular } from "../blogs/blogsApi";

const PAGE_SIZE = 9;

/**
 * Blog listing.
 *
 * One request serves the whole page. The previous version asked the API twice
 * (a listing call and a separate "popular" call) and then, if either failed,
 * quietly stored an empty array — which is why production could show a
 * headline, a "Popular Posts / No articles yet." sidebar and a large blank
 * grid with no error anywhere.
 *
 * Filtering, searching and paging are all client-side over that single payload,
 * so switching category is instant and never re-hits the database.
 */
export default function Blog() {
  const [searchParams, setSearchParams] = useSearchParams();

  const [status, setStatus] = useState("loading"); // loading | ready | failed
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState(null);
  const [attempt, setAttempt] = useState(0);

  const [query, setQuery] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState(() => searchParams.get("category") || "All");
  const [visible, setVisible] = useState(PAGE_SIZE);

  /* Used to tell "the user typed" apart from "the URL changed". */
  const filterChange = useRef(null);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setError(null);

    fetchBlogs().then((result) => {
      if (!active) return;
      setPosts(result.posts);
      setCategories(result.categories);
      setError(result.error);
      setStatus(result.ok ? "ready" : "failed");
    });

    return () => {
      active = false;
    };
  }, [attempt]);

  /* A category that no longer exists would silently hide every article. */
  useEffect(() => {
    if (status !== "ready" || !categories.length) return;
    if (category !== "All" && !categories.includes(category)) setCategory("All");
  }, [status, categories, category]);

  /* Search and category live in the URL so a filtered view can be shared. */
  useEffect(() => {
    const next = {};
    if (query.trim()) next.search = query.trim();
    if (category !== "All") next.category = category;
    const changed =
      (searchParams.get("search") || "") !== (next.search || "") ||
      (searchParams.get("category") || "") !== (next.category || "");
    if (!changed) return;

    if (filterChange.current === "query") {
      /* Typing should not fill the back button with one entry per keystroke. */
      setSearchParams(next, { replace: true });
    } else {
      setSearchParams(next);
    }
    filterChange.current = null;
  }, [query, category, searchParams, setSearchParams]);

  const onQueryChange = useCallback((value) => {
    filterChange.current = "query";
    setVisible(PAGE_SIZE);
    setQuery(value);
  }, []);

  const onCategoryChange = useCallback((value) => {
    filterChange.current = "category";
    setVisible(PAGE_SIZE);
    setCategory(value);
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return posts.filter((post) => {
      if (category !== "All" && post.category !== category) return false;
      if (!term) return true;
      const haystack = [post.title, post.excerpt, post.category, ...post.tags, post.plainText]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [posts, query, category]);

  /* The lead article follows the active filter, and is left out of the grid so
     the same story is never shown twice. With a single article it stays in the
     grid instead, so the page is never left with nothing. */
  const { featured, rest } = useMemo(() => {
    if (!filtered.length) return { featured: null, rest: [] };
    const lead = filtered.find((post) => post.featured) || filtered[0];
    return {
      featured: lead,
      rest: filtered.length > 1 ? filtered.filter((post) => post.id !== lead.id) : [],
    };
  }, [filtered]);

  const popular = useMemo(() => orderPopular(posts), [posts]);
  const hasFilters = Boolean(query.trim()) || category !== "All";
  const loading = status === "loading";
  const shown = rest.slice(0, visible);

  const retry = () => setAttempt((n) => n + 1);
  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blogs` : "";

  return (
    <>
      <SEO
        fullTitle="Nutrition & Wellness Insights | GOLZ"
        description="Practical nutrition guidance, healthy recipes, wellness insights and expert advice from GOLZ — nutrition, weight management, PCOS, diabetes and immunity articles for a healthier everyday diet."
        keywords="nutrition blog, healthy recipes, wellness tips, diet advice, weight management, PCOS diet, diabetes diet, immunity foods"
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Nutrition & Wellness Insights",
          description:
            "Practical nutrition guidance, healthy recipes, wellness insights, and expert advice from GOLZ.",
          url: canonical,
          publisher: { "@type": "Organization", name: "GOLZ (Giggles of Livez)" },
          blogPost: filtered.slice(0, 10).map((post) => ({
            "@type": "BlogPosting",
            headline: post.title,
            url: typeof window !== "undefined" ? `${window.location.origin}${post.url}` : post.url,
            datePublished: post.publishedAt || post.createdAt,
            ...(post.cover ? { image: post.cover } : {}),
          })),
        }}
      />

      <BlogHero />

      <section className="border-b border-line bg-white py-10 sm:py-12">
        <div className="container-x">
          <BlogSearch value={query} onChange={onQueryChange} resultCount={filtered.length} loading={loading} />
          {!loading && categories.length ? (
            <div className="mt-8">
              <BlogCategories categories={categories} active={category} onChange={onCategoryChange} />
            </div>
          ) : null}
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
            <div>
              {loading ? (
                <BlogGrid posts={[]} loading />
              ) : status === "failed" ? (
                <BlogGrid posts={[]} error={error?.message} onRetry={retry} />
              ) : featured ? (
                <Reveal>
                  <BlogFeatured blog={featured} />
                </Reveal>
              ) : null}

              {!loading && status !== "failed" && rest.length ? (
                <>
                  <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line pb-3">
                    <h2 className="font-heading text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      {hasFilters ? "Matching Articles" : "All Articles"}
                    </h2>
                    <p className="text-sm text-muted" aria-live="polite">
                      {rest.length} {rest.length === 1 ? "article" : "articles"}
                    </p>
                  </div>

                  <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" data-testid="card-grid">
                    {shown.map((post, index) => (
                      <Reveal key={post.id} delay={Math.min(index, 5) * 0.04}>
                        <BlogCard blog={post} />
                      </Reveal>
                    ))}
                  </div>

                  {visible < rest.length ? (
                    <div className="mt-10 flex justify-center">
                      <button
                        type="button"
                        onClick={() => setVisible((n) => n + PAGE_SIZE)}
                        className="btn-outline !py-3.5 !text-base"
                      >
                        Load more articles
                      </button>
                    </div>
                  ) : null}
                </>
              ) : null}

              {/* Only when there is nothing at all. With a single article the
                  lead story is the whole list, so an empty-state message here
                  would contradict the article shown directly above it. */}
              {!loading && status !== "failed" && !featured ? (
                <BlogGrid posts={[]} hasFilters={hasFilters} />
              ) : null}
            </div>

            <BlogSidebar posts={popular.posts} tracked={popular.tracked} loading={loading} />
          </div>
        </div>
      </section>

      {!loading && status === "ready" && posts.length ? (
        <section className="bg-section-sage section-pad">
          <div className="container-x text-center">
            <h2 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">
              Ready to eat better, feel better?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted">
              Every article here is written to be useful on its own. A consultation takes it further with a plan built
              around your goals, your routine and your body.
            </p>
            <Link to="/contact" className="btn-primary mt-8 !py-4 !text-base lg:!text-[18px]">
              Book Consultation
            </Link>
          </div>
        </section>
      ) : null}
    </>
  );
}