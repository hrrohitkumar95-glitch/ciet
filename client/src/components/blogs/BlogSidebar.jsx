import PopularPosts from "./PopularPosts";
import BlogCTA from "./BlogCTA";

/** Right-hand blog sidebar: popular posts stacked above the consultation CTA. */
export default function BlogSidebar({ posts = [] }) {
  return (
    <aside className="space-y-7 lg:sticky lg:top-28 lg:self-start">
      <PopularPosts posts={posts} />
      <BlogCTA />
    </aside>
  );
}
