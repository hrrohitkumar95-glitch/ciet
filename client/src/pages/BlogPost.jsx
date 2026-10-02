import { useCallback, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";
import SEO from "../components/SEO";
import LazyImage from "../components/LazyImage";
import BlogArticleContent from "../components/blogs/BlogArticleContent";
import ShareArticle from "../components/blogs/ShareArticle";
import AuthorCard from "../components/blogs/AuthorCard";
import RelatedArticles from "../components/blogs/RelatedArticles";
import { fetchBlogBySlug, fetchRelated, coverAt, coverSrcSet } from "../blogs/blogsApi";
import { stripHtml } from "../utils/helpers";

/**
 * Single article.
 *
 * Three states are kept apart on purpose: still loading, genuinely missing
 * (a 404, which is a real answer), and temporarily unreachable. Only the last
 * one offers a retry, because retrying a slug that does not exist is pointless.
 */
export default function BlogPost() {
  const { slug } = useParams();
  const [status, setStatus] = useState("loading"); // loading | ready | missing | failed
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let active = true;
    setStatus("loading");
    setBlog(null);
    setRelated([]);
    window.scrollTo({ top: 0 });

    fetchBlogBySlug(slug).then((result) => {
      if (!active) return;
      if (result.notFound) {
        setStatus("missing");
        return;
      }
      if (!result.post) {
        setStatus("failed");
        return;
      }
      setBlog(result.post);
      setStatus("ready");

      fetchRelated(slug).then((items) => {
        if (active) setRelated(items);
      });
    });

    return () => {
      active = false;
    };
  }, [slug, attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  if (status === "missing" || (status === "ready" && !blog)) {
    return (
      <>
        <SEO
          fullTitle="Article not found | GOLZ"
          description="The article you are looking for may have been moved or removed."
          noindex
        />
        <div className="container-x py-32 text-center sm:py-40">
          <p className="text-sm font-semibold uppercase tracking-wider text-limeDark">404</p>
          <h1 className="mt-3 font-heading text-3xl font-semibold text-ink sm:text-4xl">Article not found</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            The article you are looking for may have been moved or removed.
          </p>
          <Link to="/blogs" className="btn-primary mt-8 !py-3.5 !text-base">
            <ArrowLeft size={17} aria-hidden="true" />
            Back to Blogs
          </Link>
        </div>
      </>
    );
  }

  if (status === "failed") {
    return (
      <>
        <SEO fullTitle="Article unavailable | GOLZ" description="This article could not be loaded." noindex />
        <div className="container-x py-32 text-center sm:py-40">
          <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">This article did not load</h1>
          <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
            The connection was interrupted. Your article is still there — try loading it again.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button type="button" onClick={retry} className="btn-primary !py-3.5 !text-base">
              Try again
            </button>
            <Link to="/blogs" className="btn-outline !py-3.5 !text-base">
              Back to Blogs
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (status === "loading" || !blog) {
    return (
      <div className="container-x py-32 sm:py-40" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading article…</span>
        <div className="mx-auto max-w-3xl space-y-4" aria-hidden="true">
          <div className="h-4 w-28 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
          <div className="h-10 w-full animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
          <div className="h-10 w-3/4 animate-pulse rounded-2xl bg-line motion-reduce:animate-none" />
          <div className="aspect-video w-full animate-pulse rounded-[24px] bg-line motion-reduce:animate-none" />
          <div className="h-4 w-full animate-pulse rounded-full bg-line motion-reduce:animate-none" />
          <div className="h-4 w-11/12 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        </div>
      </div>
    );
  }

  const url = typeof window !== "undefined" ? window.location.href : "";
  const description = (blog.excerpt || stripHtml(blog.content).slice(0, 160)).trim();
  const shareImage = blog.cover ? coverAt(blog.cover, 1200) : "";
  const published = blog.publishedAt || blog.createdAt || null;
  const modified = blog.updatedAt || published;

  return (
    <>
      <SEO
        title={blog.title}
        description={description}
        image={shareImage}
        keywords={blog.tags.join(", ")}
        canonical={url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          description,
          ...(shareImage ? { image: shareImage } : {}),
          datePublished: published,
          dateModified: modified,
          ...(blog.author ? { author: { "@type": "Person", name: blog.author } } : {}),
          ...(blog.category ? { articleSection: blog.category } : {}),
          ...(blog.tags.length ? { keywords: blog.tags.join(", ") } : {}),
          publisher: { "@type": "Organization", name: "GOLZ (Giggles of Livez)" },
          mainEntityOfPage: { "@type": "WebPage", "@id": url },
        }}
      />

      <article>
        <header className="relative overflow-hidden bg-primary pb-14 pt-[104px] sm:pb-16 lg:pt-[120px]">
          <div className="absolute -right-20 -top-10 h-72 w-72 rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />
          <div className="container-x relative z-10">
            <Link
              to="/blogs"
              className="inline-flex items-center gap-2 text-sm text-[#DBE6D5]/80 transition hover:text-lime"
            >
              <ArrowLeft size={15} aria-hidden="true" />
              All articles
            </Link>

            <div className="mt-6 max-w-3xl">
              {blog.category ? (
                <Link
                  to={`/blogs?category=${encodeURIComponent(blog.category)}`}
                  className="mb-5 inline-block rounded-full bg-lime px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink transition hover:bg-white"
                >
                  {blog.category}
                </Link>
              ) : null}

              <h1 className="font-heading text-3xl font-semibold leading-[1.15] text-[#EEF3EA] sm:text-4xl lg:text-[46px]">
                {blog.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#DBE6D5]/80">
                {blog.author ? <span>{blog.author}</span> : null}
                {blog.author && published ? <span aria-hidden="true">·</span> : null}
                {published ? (
                  <time dateTime={published}>{new Date(published).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
                ) : null}
                {blog.readingTime ? <span>{blog.readingTime} min read</span> : null}
              </div>
            </div>
          </div>
        </header>

        <section className="section-pad">
          <div className="container-x">
            <div className="mx-auto max-w-3xl">
              {shareImage ? (
                <LazyImage
                  src={shareImage}
                  srcSet={coverSrcSet(blog.cover)}
                  sizes="(min-width: 768px) 768px, 100vw"
                  alt={blog.title ? `${blog.title} — featured image` : "Article featured image"}
                  className="mb-12 aspect-video w-full rounded-[24px] shadow-lift"
                  loading="eager"
                />
              ) : null}

              <BlogArticleContent content={blog.content} />

              {blog.tags.length ? (
                <div className="mt-12 flex flex-wrap items-center gap-2.5">
                  <Tag size={17} className="text-primary" aria-hidden="true" />
                  {blog.tags.map((tag) => (
                    <Link
                      key={tag}
                      to={`/blogs?search=${encodeURIComponent(tag)}`}
                      className="chip text-sm"
                      aria-label={`Search articles for ${tag}`}
                    >
                      {tag}
                    </Link>
                  ))}
                </div>
              ) : null}

              <ShareArticle url={url} title={blog.title} />
              <AuthorCard author={blog.author} />

              <div className="mt-14 rounded-[24px] bg-primary p-8 text-center shadow-card sm:p-10">
                <h2 className="font-heading text-2xl font-semibold text-[#EEF3EA] sm:text-3xl">
                  Want a plan built around you?
                </h2>
                <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-[#B6CCAF] sm:text-base">
                  Book a consultation and turn these ideas into a routine that fits your goals, your schedule and your
                  body.
                </p>
                <Link to="/contact" className="btn-lime mt-7 !px-7 !py-4 !text-base">
                  Book Consultation
                </Link>
              </div>
            </div>
          </div>
        </section>
      </article>

      <RelatedArticles posts={related} />
    </>
  );
}