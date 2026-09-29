import { Link } from "react-router-dom";
import { TrendingUp, Clock } from "lucide-react";
import { formatDate } from "../../utils/helpers";

/** Sidebar widget listing the four most-read articles. */
export default function PopularPosts({ posts = [] }) {
  const items = posts.slice(0, 4);

  return (
    <section className="card p-6" aria-labelledby="popular-posts-heading">
      <h2 id="popular-posts-heading" className="flex items-center gap-2 font-heading text-lg font-semibold text-ink">
        <TrendingUp size={18} className="text-primary" aria-hidden="true" />
        Popular Posts
      </h2>

      {items.length === 0 ? (
        <p className="mt-4 text-sm text-muted">No articles yet.</p>
      ) : (
        <ul className="mt-5 space-y-5">
          {items.map((blog) => (
            <li key={blog._id || blog.slug}>
              <Link to={`/blogs/${blog.slug}`} className="group flex gap-3.5">
                <span className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-sage">
                  {blog.cover ? (
                    <img
                      src={blog.cover}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover transition-transform duration-500 motion-reduce:transform-none group-hover:scale-105"
                    />
                  ) : null}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="line-clamp-2 block text-sm font-medium leading-snug text-ink transition-colors group-hover:text-primary">
                    {blog.title}
                  </span>
                  <span className="mt-1.5 flex items-center gap-1.5 text-xs text-muted">
                    <Clock size={11} aria-hidden="true" />
                    {formatDate(blog.publishedAt || blog.createdAt)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
