import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Calendar, Clock, User, Tag, Share2, ArrowLeft, Facebook, Twitter, Linkedin,
  MessageCircle, Check,
} from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import BlogCard from "../components/BlogCard";
import PageLoader from "../components/PageLoader";
import { formatDate, stripHtml } from "../utils/helpers";

export default function BlogPost() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [related, setRelated] = useState([]);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setBlog(null);
    setError(false);
    api.get(`/public/blogs/${slug}`).then(({ data }) => {
      setBlog(data);
      api.get(`/public/blogs/${slug}/related`).then(({ data: r }) => setRelated(r || [])).catch(() => setRelated([]));
    }).catch(() => setError(true));
    window.scrollTo({ top: 0 });
  }, [slug]);

  if (error) {
    return (
      <div className="container-x py-48 text-center">
        <h1 className="text-3xl font-bold text-charcoal">Article not found</h1>
        <Link to="/blogs" className="btn-primary mt-8"><ArrowLeft size={17} /> Back to Blog</Link>
      </div>
    );
  }

  if (!blog) return <div className="py-48"><PageLoader label="Loading article…" /></div>;

  const url = typeof window !== "undefined" ? window.location.href : "";
  const shares = [
    { label: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}` },
    { label: "Twitter", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(blog.title)}` },
    { label: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}` },
    { label: "WhatsApp", Icon: MessageCircle, href: `https://wa.me/?text=${encodeURIComponent(blog.title + " " + url)}` },
  ];

  const copyLink = async () => {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* noop */ }
  };

  return (
    <>
      <SEO
        title={blog.seoTitle || blog.title}
        description={blog.metaDescription || stripHtml(blog.excerpt || blog.content).slice(0, 160)}
        image={blog.cover}
        keywords={blog.tags?.join(", ")}
        canonical={url}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "BlogPosting",
          headline: blog.title,
          image: blog.cover,
          datePublished: blog.publishedAt || blog.createdAt,
          author: { "@type": "Person", name: blog.author },
          keywords: blog.tags?.join(", "),
        }}
      />

      <section className="relative overflow-hidden bg-charcoal pb-28 pt-36">
        <div className="absolute inset-0">
          {blog.cover && <img src={blog.cover} alt="" className="h-full w-full object-cover opacity-25" loading="lazy" />}
          <div className="absolute inset-0 bg-gradient-to-b from-charcoal/70 to-charcoal" />
        </div>
        <div className="container-x relative z-10 max-w-4xl">
          <Link to="/blogs" className="mb-6 inline-flex items-center gap-2 text-sm text-white/60 transition hover:text-sage">
            <ArrowLeft size={16} /> Back to Blog
          </Link>
          <span className="mb-4 inline-block rounded-full bg-primary px-4 py-1.5 text-xs font-semibold text-white">{blog.category}</span>
          <h1 className="text-3xl font-bold leading-tight text-white sm:text-4xl lg:text-[2.75rem]">{blog.title}</h1>
          <div className="mt-6 flex flex-wrap items-center gap-5 text-sm text-white/65">
            <span className="flex items-center gap-2"><User size={15} /> {blog.author}</span>
            <span className="flex items-center gap-2"><Calendar size={15} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
            <span className="flex items-center gap-2"><Clock size={15} /> {blog.readingTime} min read</span>
          </div>
        </div>
      </section>

      <section className="section-pad">
        <div className="container-x max-w-4xl">
          {blog.cover && (
            <img src={blog.cover} alt={blog.title} className="-mt-20 mb-10 aspect-video w-full rounded-[2rem] object-cover shadow-lift ring-8 ring-white" loading="lazy" />
          )}

          <div className="rich-text" dangerouslySetInnerHTML={{ __html: blog.content }} />

          {(blog.tags || []).length > 0 && (
            <div className="mt-12 flex flex-wrap items-center gap-2.5">
              <Tag size={17} className="text-primary" />
              {blog.tags.map((t) => (
                <Link key={t} to={`/blog?search=${encodeURIComponent(t)}`} className="chip">{t}</Link>
              ))}
            </div>
          )}

          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-3xl bg-primary/5 p-6">
            <p className="flex items-center gap-2.5 font-heading text-lg font-semibold text-charcoal">
              <Share2 size={19} className="text-primary" /> Share this article
            </p>
            <div className="flex gap-2.5">
              {shares.map(({ label, Icon, href }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`}
                  className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-charcoal/60 shadow-card transition hover:bg-primary hover:text-white">
                  <Icon size={18} />
                </a>
              ))}
              <button onClick={copyLink} aria-label="Copy link"
                className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-charcoal/60 shadow-card transition hover:bg-primary hover:text-white">
                {copied ? <Check size={17} /> : <><Share2 size={16} /> Copy</>}
              </button>
            </div>
          </div>

          <div className="mt-10 flex items-center gap-4 rounded-3xl border border-primary/15 bg-white p-6 shadow-card">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-dark font-heading text-xl font-bold text-white">
              {blog.author?.[0] || "A"}
            </span>
            <div>
              <p className="font-heading font-semibold text-charcoal">{blog.author}</p>
              <p className="mt-1 text-sm leading-relaxed text-charcoal/60">
                Clinical nutritionist helping real people achieve real, lasting health through evidence-based nutrition.
              </p>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-section-sage section-pad">
          <div className="container-x">
            <h2 className="mb-10 text-center font-heading text-3xl font-bold text-charcoal">Related Articles</h2>
            <div className="grid gap-7 md:grid-cols-3">
              {related.map((b, i) => <BlogCard key={b._id} blog={b} index={i} />)}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
