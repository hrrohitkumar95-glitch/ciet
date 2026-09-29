import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowRight, BadgeCheck, CalendarCheck, Clock, RefreshCcw } from "lucide-react";
import api from "../api/client";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import { ICON_MAP } from "../utils/helpers";

/* Category taxonomy. `category` matches the Service.category values in the CMS;
   `id` is the anchor used by the category navigation. */
const CATEGORIES = [
  {
    id: "metabolic-lifestyle",
    category: "metabolic",
    no: "1",
    title: "Metabolic & Lifestyle",
    blurb: "Weight, blood sugar, hormones and heart health.",
  },
  {
    id: "women-family",
    category: "family",
    no: "2",
    title: "Women & Family",
    blurb: "Pregnancy, women's health, children and senior care.",
  },
  {
    id: "specialised-clinical",
    category: "specialised",
    no: "3",
    title: "Specialised & Clinical",
    blurb: "Special-needs children and oncology nutrition.",
  },
  {
    id: "performance-precision",
    category: "performance",
    no: "4",
    title: "Performance & Precision",
    blurb: "Sports nutrition and DNA-based precision plans.",
  },
];

const STEPS = [
  {
    title: "Consultation",
    text: "We start by understanding you: your health history, condition, lifestyle, food habits and goals.",
  },
  {
    title: "Assessment",
    text: "We review your labs, body composition and — where relevant — your DNA and gut-microbiome data, so the plan is built on evidence, not guesswork.",
  },
  {
    title: "Your personalised plan",
    text: "You get a plan designed around your body and your everyday food — not a generic chart.",
  },
  {
    title: "Monitoring & adjustment",
    text: "We track your progress and refine the plan as your body responds, so it keeps working over time.",
  },
];

function reducedMotion() {
  return typeof window !== "undefined" && Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

/* Single service card — one stretched link keeps the whole card clickable
   without duplicating links for screen readers. */
function ServiceTile({ service }) {
  const Icon = ICON_MAP.get(service.icon) || ICON_MAP.get("Sparkles");
  const title = service.title?.trim();
  const summary = service.shortDesc?.trim();

  return (
    <Reveal className="h-full">
      <article className="group relative flex h-full flex-col rounded-[20px] border border-line bg-white p-7 transition duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-soft sm:p-8">
        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-[14px] bg-sage text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
          {Icon ? <Icon size={24} /> : null}
        </span>

        {title ? <h3 className="font-heading text-[21px] font-semibold leading-snug text-ink">{title}</h3> : null}
        {summary ? <p className="mt-3 text-[15px] leading-relaxed text-muted">{summary}</p> : null}

        {service.credibility ? (
          <p className="mt-5 flex items-start gap-2 text-[13px] font-medium leading-relaxed text-primary">
            <BadgeCheck size={16} className="mt-0.5 shrink-0 text-limeDark" />
            {service.credibility}
          </p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-7">
          {service.duration ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Clock size={14} /> {service.duration}
            </span>
          ) : null}
          <Link
            to={`/services/${service.slug}`}
            className="ml-auto inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-primary after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
            aria-label={title ? `View details for ${title}` : "View service details"}
          >
            View details
            <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1 motion-reduce:transition-none" />
          </Link>
        </div>
      </article>
    </Reveal>
  );
}

export default function Services() {
  const [services, setServices] = useState(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [activeId, setActiveId] = useState(CATEGORIES[0].id);

  const load = useCallback(() => {
    setFailed(false);
    setServices(null);
    api
      .get("/public/services")
      .then(({ data }) => {
        setServices(Array.isArray(data) ? data : []);
        setFailed(false);
      })
      .catch(() => {
        setServices([]);
        setFailed(true);
      });
  }, []);

  useEffect(() => {
    load();
  }, [load, attempt]);

  const { sections, extras } = useMemo(() => {
    const list = services || [];
    const known = new Set(CATEGORIES.map((c) => c.category));
    return {
      sections: CATEGORIES.map((c) => ({ ...c, items: list.filter((s) => s.category === c.category) })).filter(
        (c) => c.items.length > 0
      ),
      extras: list.filter((s) => !known.has(s.category)),
    };
  }, [services]);

  const navItems = extras.length
    ? [...sections, { id: "more-services", no: "+", title: "More Services" }]
    : sections;

  /* Highlight the category currently in view. */
  useEffect(() => {
    if (!navItems.length) return;
    const targets = navItems.map((c) => document.getElementById(c.id)).filter(Boolean);
    if (!targets.length) return;

    const onScroll = () => {
      let current = targets[0].id;
      for (const el of targets) {
        if (el.getBoundingClientRect().top - 160 <= 0) current = el.id;
      }
      setActiveId(current);
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [navItems]);

  /* Honour a deep link such as /services#women-family. */
  useEffect(() => {
    const id = window.location.hash.replace("#", "");
    if (!id) return;
    const timer = setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
    }, 150);
    return () => clearTimeout(timer);
  }, [services]);

  const jump = (event, id) => {
    const el = document.getElementById(id);
    if (!el) return;
    event.preventDefault();
    el.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  };

  return (
    <>
      <SEO
        title="Services"
        description="Nutrition & care for every stage of life — weight, diabetes, thyroid & PCOS, pregnancy, children's health, special needs, oncology, sports and precision nutrition. Personalised plans built around you."
        keywords="nutrition services, diet plans, weight loss program, PCOS diet, diabetes diet"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "Nutrition Services",
          itemListElement: (services || []).map((s, i) => ({ "@type": "ListItem", position: i + 1, name: s.title })),
        }}
      />

      {/* ========================= HERO ========================= */}
      <section className="relative overflow-hidden border-b border-line bg-paper">
        <div className="absolute -right-32 top-24 h-[24rem] w-[24rem] rounded-full bg-sage/70 blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10">
          <div className="flex min-h-[420px] items-center pb-16 pt-[116px] md:min-h-[460px] md:pb-20 md:pt-[128px] lg:min-h-[500px] lg:pb-24 lg:pt-[140px]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: [0.21, 0.65, 0.36, 1] }}
              className="max-w-[800px]"
            >
              <span className="mb-6 inline-flex items-center rounded-full border border-line bg-white px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                Services
              </span>
              <h1 className="font-heading text-[38px] font-semibold leading-[1.08] tracking-tight text-ink sm:text-[50px] md:text-[56px] lg:text-[68px]">
                Nutrition &amp; care for every stage of life
              </h1>
              <p className="mt-6 max-w-[600px] text-base leading-relaxed text-muted sm:text-[17px]">
                From weight and diabetes to pregnancy, children's health and special needs — every plan is
                built around your body, your goals and your food habits. No fad diets. No crash plans. Just
                science-backed nutrition you can actually live with.
              </p>
              <Link to="/contact" className="btn-primary mt-9">
                <CalendarCheck size={19} /> Book a Consultation
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ================= CATEGORY NAVIGATION ================= */}
      <nav aria-label="Service categories" className="sticky top-[72px] z-40 border-b border-line bg-white/90 backdrop-blur-[10px]">
        <div className="container-x flex items-center gap-1 overflow-x-auto py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((cat) => {
            const isActive = activeId === cat.id;
            return (
              <a
                key={cat.id}
                href={`#${cat.id}`}
                onClick={(e) => jump(e, cat.id)}
                aria-current={isActive ? "true" : undefined}
                className={`flex shrink-0 items-center whitespace-nowrap rounded-full px-4 py-2 text-[14px] font-medium transition-colors ${
                  isActive ? "bg-primary/10 text-primary" : "text-ink/65 hover:bg-primary/5 hover:text-primary"
                }`}
              >
                <span className="mr-2 text-[11px] font-semibold text-limeDark">{cat.no}</span>
                {cat.title}
              </a>
            );
          })}
        </div>
      </nav>

      {/* ================= CATEGORY SECTIONS ================= */}
      {!services && !failed ? (
        <section className="section-pad">
          <div className="container-x grid gap-5 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-[260px] animate-pulse rounded-[20px] border border-line bg-white/70 motion-reduce:animate-none" />
            ))}
          </div>
        </section>
      ) : null}

      {failed ? (
        <section className="section-pad">
          <div className="container-x">
            <div className="mx-auto max-w-lg rounded-[20px] border border-line bg-white p-10 text-center">
              <AlertCircle size={30} className="mx-auto text-limeDark" />
              <h2 className="mt-5 font-heading text-2xl font-semibold text-ink">We couldn't load the service list</h2>
              <p className="mt-3 text-sm leading-relaxed text-muted">
                Please try again — or talk to us directly and we'll guide you to the right programme.
              </p>
              <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
                <button type="button" onClick={() => setAttempt((a) => a + 1)} className="btn-primary">
                  <RefreshCcw size={17} /> Try again
                </button>
                <Link to="/contact" className="btn-outline">Contact us</Link>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {sections.map((cat, index) => (
        <section
          key={cat.id}
          id={cat.id}
          aria-labelledby={`${cat.id}-title`}
          className={`scroll-mt-[128px] section-pad ${index % 2 === 0 ? "bg-white" : "bg-paper"}`}
        >
          <div className="container-x">
            <Reveal>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-limeDark">
                {cat.no} · {cat.title}
              </span>
              <h2 id={`${cat.id}-title`} className="mt-4 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
                {cat.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">{cat.blurb}</p>
            </Reveal>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {cat.items.map((service) => (
                <ServiceTile key={service._id || service.slug} service={service} />
              ))}
            </div>
          </div>
        </section>
      ))}

      {extras.length > 0 ? (
        <section id="more-services" aria-labelledby="more-services-title" className="scroll-mt-[128px] section-pad bg-white">
          <div className="container-x">
            <Reveal>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-limeDark">More</span>
              <h2 id="more-services-title" className="mt-4 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl">
                More Services
              </h2>
              <p className="mt-4 max-w-xl text-base leading-relaxed text-muted">
                Additional services — every plan is personalised to your body and goals.
              </p>
            </Reveal>
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {extras.map((service) => (
                <ServiceTile key={service._id || service.slug} service={service} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ================= HOW IT WORKS ================= */}
      <section className="bg-primary section-pad">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="mb-6 inline-flex items-center rounded-full border border-lime/40 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">
              How It Works
            </span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#EEF3EA] sm:text-4xl lg:text-[46px] lg:leading-[1.1]">
              One Method, Personalised For Every Condition
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#C3D4BE]">
              Every plan above, however different the condition, follows the same personalised method.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08} className="h-full">
                <div className="flex h-full flex-col rounded-[20px] border border-white/15 bg-white/[0.07] p-7 transition-colors duration-300 hover:bg-white/[0.11]">
                  <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-lime font-heading text-lg font-semibold text-ink">
                    {i + 1}
                  </span>
                  <h3 className="font-heading text-[19px] font-semibold leading-snug text-[#EEF3EA]">{step.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-[#A9C0A0]">{step.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FINAL CTA ================= */}
      <section className="bg-cream section-pad">
        <div className="container-x">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[42px] lg:leading-[1.1]">
              Ready to build a plan around you?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
              Start with a personalised consultation and take the next step toward nutrition that fits your
              body, lifestyle and goals.
            </p>
            <Link to="/contact" className="btn-primary mt-9">
              <CalendarCheck size={19} /> Book a Consultation
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
