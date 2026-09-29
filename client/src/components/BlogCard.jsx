import { Link } from "react-router-dom";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import LazyImage from "./LazyImage";
import { formatDate, truncate, stripHtml } from "../utils/helpers";

export default function BlogCard({ blog, index = 0 }) {
  return (
    <Link
      to={`/blogs/${blog.slug}`}
      className="card group flex h-full flex-col overflow-hidden hover:-translate-y-2 hover:shadow-lift"
    >
      <div className="relative h-52 overflow-hidden">
        <LazyImage
          src={blog.cover}
          alt={blog.title}
          className="h-full w-full"
          imgClassName="group-hover:scale-110 transition-transform duration-700"
        />
        <span className="absolute left-4 top-4 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white shadow-soft">
          {blog.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="mb-3 flex items-center gap-4 text-xs text-charcoal/50">
          <span className="inline-flex items-center gap-1.5"><Calendar size={13} /> {formatDate(blog.publishedAt || blog.createdAt)}</span>
          <span className="inline-flex items-center gap-1.5"><Clock size={13} /> {blog.readingTime} min read</span>
        </div>
        <h3 className="mb-2 font-heading text-lg font-semibold leading-snug text-charcoal transition group-hover:text-primary">
          {blog.title}
        </h3>
        <p className="mb-5 flex-1 text-sm leading-relaxed text-charcoal/60">
          {truncate(stripHtml(blog.excerpt || blog.content), 110)}
        </p>
        <span className="inline-flex items-center gap-2 font-heading text-sm font-semibold text-primary">
          Read More <ArrowRight size={16} className="transition-transform group-hover:translate-x-1.5" />
        </span>
      </div>
    </Link>
  );
}
