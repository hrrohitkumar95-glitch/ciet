import { Link } from "react-router-dom";
import { SearchX, RefreshCw, WifiOff } from "lucide-react";
import BlogCard from "./BlogCard";

/** One skeleton shaped like a real card, so nothing jumps when data arrives. */
function CardSkeleton() {
  return (
    <div className="card overflow-hidden border border-line" aria-hidden="true">
      <div className="aspect-[16/10] w-full animate-pulse bg-sage motion-reduce:animate-none" />
      <div className="space-y-3 p-6">
        <div className="h-3 w-24 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-5 w-full animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
        <div className="h-5 w-3/4 animate-pulse rounded-lg bg-line motion-reduce:animate-none" />
        <div className="h-3 w-full animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-3 w-5/6 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
      </div>
    </div>
  );
}

/**
 * Article grid: three across on desktop, two on tablet, one on mobile.
 *
 * The three states are deliberately different. A failed request must never look
 * like an empty blog, so the error keeps its own panel with a retry, while
 * "nothing matched your filters" and "there are no articles yet" stay distinct
 * messages with different actions.
 */
export default function BlogGrid({ posts = [], loading = false, error = null, onRetry, hasFilters = false }) {
  if (loading) {
    return (
      <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading articles…</span>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-[24px] border border-line bg-white px-6 py-16 text-center">
        <WifiOff size={30} className="mx-auto text-primary" aria-hidden="true" />
        <h3 className="mt-4 font-heading text-xl font-semibold text-ink">We could not load the articles</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{error}</p>
        {onRetry ? (
          <button type="button" onClick={onRetry} className="btn-primary mt-7 !py-3.5 !text-base">
            <RefreshCw size={17} aria-hidden="true" />
            Try again
          </button>
        ) : null}
      </div>
    );
  }

  if (posts.length === 0) {
    if (hasFilters) {
      return (
        <div className="rounded-[24px] border border-line bg-white px-6 py-16 text-center">
          <SearchX size={30} className="mx-auto text-primary" aria-hidden="true" />
          <h3 className="mt-4 font-heading text-xl font-semibold text-ink">No articles match that search</h3>
          <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
            Try a different keyword, or browse every category to see the full library.
          </p>
          <Link to="/blogs" className="btn-outline mt-7 !py-3.5 !text-base">
            View all articles
          </Link>
        </div>
      );
    }

    return (
      <div className="rounded-[24px] border border-line bg-white px-6 py-16 text-center">
        <h3 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">New Insights Coming Soon</h3>
        <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted">
          We’re preparing practical nutrition, wellness and healthy lifestyle articles from GOLZ. Check back soon.
        </p>
        <Link to="/contact" className="btn-primary mt-8 !py-3.5 !text-base">
          Book Consultation
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-7 sm:grid-cols-2 lg:grid-cols-3">
      {posts.map((blog, index) => (
        <BlogCard key={blog.id || blog._id || blog.slug} blog={blog} eager={index < 3} />
      ))}
    </div>
  );
}