import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CalendarCheck, ShieldCheck } from "lucide-react";

/** Services hero — the page's primary statement and booking entry point. */
export default function ServicesHero({
  title = "Personalized Nutrition & Wellness Services",
  description = "GOLZ provides personalized nutrition and wellness guidance built around your body, your condition and your goals — with practical plans you can actually follow, and support that continues as your body responds.",
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-paper">
      <div className="absolute -right-40 -top-24 h-[28rem] w-[28rem] rounded-full bg-sage/70 blur-3xl" aria-hidden="true" />
      <div className="absolute -bottom-40 -left-32 h-[24rem] w-[24rem] rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />

      <div className="container-x relative z-10">
        <div className="flex min-h-[440px] items-center py-16 md:min-h-[500px] md:py-20 lg:min-h-[560px] lg:py-24">
          <div className="max-w-[860px]">
            <motion.span
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary"
            >
              <ShieldCheck size={14} aria-hidden="true" />
              GOLZ Nutrition Services
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05, ease: [0.21, 0.65, 0.36, 1] }}
              className="mt-6 font-heading text-[36px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[48px] md:text-[56px] lg:text-[64px]"
            >
              {title}
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.12, ease: [0.21, 0.65, 0.36, 1] }}
              className="mt-6 max-w-[660px] text-base leading-relaxed text-muted sm:text-[17px]"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 22 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.18, ease: [0.21, 0.65, 0.36, 1] }}
              className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center"
            >
              <Link to="/contact" className="btn-primary">
                <CalendarCheck size={19} aria-hidden="true" />
                Book Consultation
              </Link>
              <Link to="/about" className="btn-outline">
                Meet Your Nutritionist
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
