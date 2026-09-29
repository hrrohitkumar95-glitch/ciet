import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, Tag } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import LazyImage from "../components/LazyImage";
import BlogArticleHero from "../components/blogs/BlogArticleHero";
import BlogArticleContent from "../components/blogs/BlogArticleContent";
import ShareArticle from "../components/blogs/ShareArticle";
import AuthorCard from "../components/blogs/AuthorCard";
import RelatedArticles from "../components/blogs/RelatedArticles";
import { stripHtml } from "../utils/helpers";

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;
    setBlog(null);
    setRelated([]);
    setError(false);
    window.scrollTo({ top: 0 });

    api
      .get(`/public/blogs/${slug}`)
      .then(({ data }) => {
        if (!active) return;
        setBlog(data);
        return api
          .get(`/public/blogs/${slug}/related`)
          .then(({ data: items }) => {
            if (active) setRelated(Array.isArray(items) ? items : []);
          })
          .catch(() => {});
      })
      .catch(() => {
        if (active) setError(true);
      });

    return () => {
      active = false;
    };
  }, [slug]);

  if (error) {
    return (
      <div className="container-x py-40 text-center">
        <h1 className="font-heading text-3xl font-semibold text-ink sm:text-4xl">Article not found</h1>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-muted">
          The article you are looking for may have been moved or removed.
        </p>
        <Link to="/blogs" className="btn-primary mt-8 !py-3.5 !text-base">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Blog
        </Link>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="container-x py-40" aria-busy="true" aria-live="polite">
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
  const description = (blog.metaDescription || stripHtml(blog.excerpt || blog.content).slice(0, 160)).trim();

  return (
    <>
      <SEO
        title={blog.seoTitle || blog.title}
        description={description}
        image={blog.cover}
        keywords={blog.tags?.join(", ")}
        canonical={url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          description,
          image: blog.cover,
          datePublished: blog.publishedAt || blog.createdAt,
          author: { "@type": "Person", name: blog.author },
          publisher: { "@type": "Organization", name: "GOLZ (Giggles of Livez)" },
          keywords: blog.tags?.join(", "),
          mainEntityOfPage: url,
        }}
      />

      <article>
        <BlogArticleHero blog={blog} />

        <section className="section-pad">
          <div className="container-x">
            <div className="mx-auto max-w-3xl">
              {blog.cover ? (
                <LazyImage
                  src={blog.cover}
                  alt={blog.title ? `${blog.title} — featured image` : "Article featured image"}
                  className="mb-12 aspect-video w-full rounded-[24px] shadow-lift"
                />
              ) : null}

              <BlogArticleContent content={blog.content} />

              {(blog.tags || []).length > 0 ? (
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
            </div>
          </div>
        </section>
      </article>

      <RelatedArticles posts={related} />
    </>
  );
}
