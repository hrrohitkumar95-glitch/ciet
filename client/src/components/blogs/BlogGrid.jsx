import BlogCard from "./BlogCard";

/** Two-column article grid with loading skeletons and a no-results state. */
export default function BlogGrid({ posts = [], loading = false }) {
  if (loading) {
    return (
      <div className="grid gap-7 sm:grid-cols-2" aria-hidden="true">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-[430px] animate-pulse rounded-[24px] border border-line bg-white/70 motion-reduce:animate-none" />
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-[24px] border border-line bg-white px-6 py-20 text-center">
        <h3 className="font-heading text-xl font-semibold text-ink">No articles found</h3>
        <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">
          We could not find anything matching your search. Try a different keyword or browse all categories.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-7 sm:grid-cols-2">
      {posts.map((blog) => (
        <BlogCard key={blog._id || blog.slug} blog={blog} />
      ))}
    </div>
  );
}
