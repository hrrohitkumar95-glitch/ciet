import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import ServicesHero from "../components/services/ServicesHero";
import ServicesIntro from "../components/services/ServicesIntro";
import ServicesGrid from "../components/services/ServicesGrid";
import ServicesNotice from "../components/services/ServicesNotice";
import WhyChooseGOLZ from "../components/services/WhyChooseGOLZ";
import ServicesCTA from "../components/services/ServicesCTA";
import { FALLBACK_SERVICES, LOADING_BUDGET_MS, loadServices } from "../services/servicesApi";

const SEO_TITLE = "Services | GOLZ \u2013 Giggles of Livez";
const SEO_DESCRIPTION =
  "Personalized nutrition and wellness services from GOLZ (Giggles of Livez) — weight management, diabetes and thyroid care, PCOS, pregnancy and children's nutrition, special needs, oncology, sports and precision nutrition. Every plan built around you.";

export default function Services() {
  const [services, setServices] = useState(null);
  const [source, setSource] = useState("api");
  const [recovering, setRecovering] = useState(false);
  const [retrying, setRetrying] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let alive = true;
    setServices(null);
    setSource("api");
    setRecovering(false);
    setRetrying(true);

    loadServices().then(({ services: items, source: origin, error }) => {
      if (!alive) return;
      setRetrying(false);
      setServices(items);
      setSource(origin);
      if (error) {
        // Developer-facing signal; visitors only see the small notice below.
        console.error("[services] live list unavailable, using bundled catalogue:", error.message);
      }
    });

    /* Skeletons are shown at most once. If the API is still silent after the
       budget, the bundled catalogue renders instead of an endless spinner. */
    const budget = setTimeout(() => {
      if (alive) setRecovering(true);
    }, LOADING_BUDGET_MS);

    return () => {
      alive = false;
      clearTimeout(budget);
    };
  }, [attempt]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  /* Never render an empty grid: fall back to the bundled catalogue whenever the
     live list has not arrived. */
  const visibleServices = services ?? (recovering ? FALLBACK_SERVICES : null);
  const loading = visibleServices === null;
  const showNotice = (source === "fallback" || (recovering && !services)) && !loading;

  const ordered = useMemo(() => (visibleServices ? [...visibleServices].sort((a, b) => a.order - b.order) : []), [visibleServices]);

  const canonical = typeof window !== "undefined" ? `${window.location.origin}/services` : "";

  return (
    <>
      <SEO
        fullTitle={SEO_TITLE}
        title="Services"
        description={SEO_DESCRIPTION}
        keywords="nutrition services, personalised diet plan, weight management, diabetes diet, thyroid & PCOS nutrition, pregnancy nutritionist, paediatric nutrition, oncology nutrition, sports nutrition"
        canonical={canonical}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: "GOLZ Nutrition & Wellness Services",
          itemListElement: ordered.map((service, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: service.title,
            url: `${canonical}/${service.slug}`,
          })),
        }}
      />

      <ServicesHero />

      <ServicesIntro />

      <section className="bg-paper pb-[60px] pt-2 md:pb-[80px] lg:pb-[100px]" aria-labelledby="services-grid-heading">
        <div className="container-x">
          <div className="flex flex-col gap-3 border-b border-line pb-8 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-limeDark">Our Services</span>
              <h2
                id="services-grid-heading"
                className="mt-3 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[42px] lg:leading-[1.12]"
              >
                {loading ? "Preparing your options" : `${ordered.length} programmes, one personalised method`}
              </h2>
            </div>

            {!loading ? (
              <p className="text-sm text-muted">
                Each programme includes a 1-on-1 consultation and a plan written for you.
              </p>
            ) : null}
          </div>

          <div className="mt-10">
            {showNotice ? <ServicesNotice onRetry={retry} busy={retrying} /> : null}
            <ServicesGrid services={ordered} loading={loading} />
          </div>

          {!loading && ordered.length === 0 ? (
            <div className="rounded-[22px] border border-line bg-white px-6 py-16 text-center">
              <p className="font-heading text-xl font-semibold text-ink">Services are being updated</p>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
                Our programme list is being refreshed. Please browse the full range on the About page or get in
                touch and we will guide you.
              </p>
              <Link to="/contact" className="btn-primary mt-7">
                Contact us
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <WhyChooseGOLZ />

      <ServicesCTA />
    </>
  );
}
