import { Link } from "react-router-dom";
import { ArrowLeft, Calendar, Clock, User } from "lucide-react";
import { motion } from "framer-motion";
import { formatDate } from "../../utils/helpers";

/** Near-black green hero shown above every article. */
export default function BlogArticleHero({ blog }) {
  const date = formatDate(blog.publishedAt || blog.createdAt);

  return (
    <section className="relative overflow-hidden bg-ink pb-20 pt-[104px] sm:pb-24 lg:pt-[120px]">
      <div className="absolute -left-24 top-0 h-72 w-72 rounded-full bg-primary/40 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-24 bottom-0 h-64 w-64 rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />

      <div className="container-x relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.65, 0.36, 1] }}
          className="mx-auto max-w-3xl"
        >
          <Link
            to="/blogs"
            className="mb-7 inline-flex items-center gap-2 rounded-lg text-sm text-[#B6CCAF] transition hover:text-lime"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Back to Blog
          </Link>

          {blog.category ? (
            <span className="mb-5 inline-block rounded-full bg-lime px-4 py-1.5 text-[11px] font-semibold uppercase tracking-widest text-ink">
              {blog.category}
            </span>
          ) : null}

          <h1 className="font-heading text-[32px] font-semibold leading-[1.12] text-[#EEF3EA] sm:text-[42px] lg:text-[52px]">
            {blog.title}
          </h1>

          <div className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-sm text-[#A9C0A0]">
            {blog.author ? (
              <span className="inline-flex items-center gap-2">
                <User size={15} aria-hidden="true" />
                {blog.author}
              </span>
            ) : null}
            {date ? (
              <span className="inline-flex items-center gap-2">
                <Calendar size={15} aria-hidden="true" />
                {date}
              </span>
            ) : null}
            {blog.readingTime ? (
              <span className="inline-flex items-center gap-2">
                <Clock size={15} aria-hidden="true" />
                {blog.readingTime} min read
              </span>
            ) : null}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
