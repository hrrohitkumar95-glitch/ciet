import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { motion } from "framer-motion";

/** Dark-green editorial hero for the blog listing. */
export default function BlogHero({
  title = "Nutrition Insights",
  description = "Practical, science-backed articles to help you eat smarter and live healthier.",
}) {
  return (
    <section className="relative overflow-hidden bg-primary pb-16 pt-[104px] sm:pb-20 lg:pt-[120px]">
      <div className="absolute -left-24 top-4 h-72 w-72 rounded-full bg-sage/10 blur-3xl" aria-hidden="true" />
      <div className="absolute -right-20 bottom-0 h-64 w-64 rounded-full bg-lime/15 blur-3xl" aria-hidden="true" />

      <div className="container-x relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.21, 0.65, 0.36, 1] }}
          className="max-w-3xl"
        >
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-sm text-[#DBE6D5]/70">
            <Link to="/" className="transition hover:text-lime">
              Home
            </Link>
            <ChevronRight size={14} aria-hidden="true" />
            <span className="text-[#EEF3EA]/90">Blog</span>
          </nav>

          <h1 className="font-heading text-4xl font-semibold leading-[1.1] text-[#EEF3EA] sm:text-5xl lg:text-[58px]">
            {title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-[#DBE6D5]/80 sm:text-lg">{description}</p>
        </motion.div>
      </div>
    </section>
  );
}
