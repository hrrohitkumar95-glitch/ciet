import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import LazyImage from "../LazyImage";
import { formatDate, stripHtml, truncate } from "../../utils/helpers";

/** Blog article card: cover image, category badge, date, reading time and excerpt. */
export default function BlogCard({ blog }) {
  if (!blog) return null;

  const title = blog.title?.trim();
  const date = formatDate(blog.publishedAt || blog.createdAt);
  const excerpt = truncate(stripHtml(blog.excerpt || blog.content), 110);

  return (
    <article className="card group relative flex h-full flex-col overflow-hidden">
      <div className="relative h-52 overflow-hidden sm:h-56">
        {blog.cover ? (
          <LazyImage
            src={blog.cover}
            alt={title ? `${title} — article cover` : "Article cover image"}
            className="h-full w-full"
            imgClassName="transition-transform duration-700 motion-reduce:transform-none group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-sage" aria-hidden="true" />
        )}

        {blog.category ? (
          <span className="absolute left-4 top-4 rounded-full bg-primary px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-white shadow-soft">
            {blog.category}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
          {date ? (
            <span className="inline-flex items-center gap-1.5">
              <Calendar size={13} aria-hidden="true" />
              {date}
            </span>
          ) : null}
          {blog.readingTime ? (
            <span className="inline-flex items-center gap-1.5">
              <Clock size={13} aria-hidden="true" />
              {blog.readingTime} min read
            </span>
          ) : null}
        </div>

        {title ? <h3 className="font-heading text-[19px] font-semibold leading-snug text-ink transition-colors group-hover:text-primary">{title}</h3> : null}
        {excerpt ? <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">{excerpt}</p> : null}

        <Link
          to={`/blogs/${blog.slug}`}
          className="relative z-10 mt-5 inline-flex w-fit items-center gap-2 rounded-lg text-sm font-semibold text-primary after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
          aria-label={title ? `Read article: ${title}` : "Read article"}
        >
          Read More
          <ArrowRight size={16} className="transition-transform duration-300 motion-reduce:transform-none group-hover:translate-x-1" aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}
