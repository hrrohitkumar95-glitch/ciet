import PopularPosts from "./PopularPosts";
import BlogCTA from "./BlogCTA";

/** Right-hand blog sidebar: article list above the consultation CTA. */
export default function BlogSidebar({ posts = [], tracked = false, loading = false }) {
  return (
    <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start">
      <PopularPosts posts={posts} tracked={tracked} loading={loading} />
      <BlogCTA />
    </aside>
  );
}