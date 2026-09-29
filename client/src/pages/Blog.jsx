import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import BlogHero from "../components/blogs/BlogHero";
import BlogSearch from "../components/blogs/BlogSearch";
import BlogCategories from "../components/blogs/BlogCategories";
import BlogGrid from "../components/blogs/BlogGrid";
import BlogSidebar from "../components/blogs/BlogSidebar";
import { stripHtml } from "../utils/helpers";

const CATEGORY_ORDER = ["Diabetes", "Immunity", "Nutrition", "PCOS", "Pregnancy", "Weight Loss"];

function orderCategories(list) {
  const rest = list.filter((item) => !CATEGORY_ORDER.includes(item));
  return [...CATEGORY_ORDER.filter((item) => list.includes(item)), ...rest];
}

export default function Blog() {
  const [searchParams] = useSearchParams();
  const [blogs, setBlogs] = useState(null);
  const [popular, setPopular] = useState([]);
  const [categories, setCategories] = useState([]);
  const [query, setQuery] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setBlogs(null);
    setError(false);

    api
      .get("/public/blogs", { params: { limit: 100, sort: "latest" } })
      .then(({ data }) => {
        if (!active) return;
        setBlogs(Array.isArray(data?.items) ? data.items : []);
        setCategories(orderCategories(Array.isArray(data?.categories) ? data.categories : []));
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    api
      .get("/public/blogs", { params: { limit: 4, sort: "popular" } })
      .then(({ data }) => setPopular(Array.isArray(data?.items) ? data.items : []))
      .catch(() => setPopular([]));
  }, []);

  const filtered = useMemo(() => {
    const term = query.trim().toLowerCase();
    return (blogs || []).filter((blog) => {
      if (category !== "All" && blog.category !== category) return false;
      if (!term) return true;
      const haystack = [blog.title, blog.excerpt, blog.category, ...(blog.tags || []), stripHtml(blog.content)]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [blogs, query, category]);

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/blogs` : "";

  return (
    <>
      <SEO
        title="Nutrition Insights"
        description="Evidence-based articles on nutrition, diabetes, immunity, PCOS, pregnancy and healthy weight management."
        keywords="nutrition blog, healthy eating, diabetes diet, immunity foods, PCOS diet, pregnancy nutrition"
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Blog",
          name: "Nutrition Insights",
          url: canonical,
        }}
      />

      <BlogHero />

      <section className="border-b border-line bg-white py-12 sm:py-14">
        <div className="container-x">
          <BlogSearch value={query} onChange={setQuery} resultCount={filtered.length} />
          <div className="mt-9">
            <BlogCategories categories={categories} active={category} onChange={setCategory} />
          </div>
        </div>
      </section>

      <section className="pb-[60px] pt-14 md:pb-[80px] sm:pt-16 lg:pb-[100px]">
        <div className="container-x">
          {error ? (
            <div className="rounded-[24px] border border-line bg-white px-6 py-20 text-center">
              <AlertCircle size={30} className="mx-auto text-primary" aria-hidden="true" />
              <h2 className="mt-4 font-heading text-xl font-semibold text-ink">We could not load the articles</h2>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
                Please refresh the page or try again in a few moments.
              </p>
              <Link to="/blogs" className="btn-primary mt-7 !py-3.5 !text-base">
                Try again
              </Link>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
              <Reveal>
                <BlogGrid posts={filtered} loading={blogs === null} />
              </Reveal>
              <BlogSidebar posts={popular} />
            </div>
          )}
        </div>
      </section>
    </>
  );
}
