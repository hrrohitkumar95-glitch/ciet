import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  GraduationCap, Award, Target, Eye, ArrowRight, CheckCircle2, BadgeCheck,
  Sparkles, HeartPulse, Quote, Baby,
} from "lucide-react";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

function CountUp({ value, suffix = "" }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1600;
          const start = performance.now();
          const tick = (now) => {
            const p = Math.min((now - start) / duration, 1);
            setDisplay(Math.round(value * (1 - Math.pow(1 - p, 3))));
            if (p < 1) requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        }
      },
      { threshold: 0.4 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

const HELP_ICONS = [Sparkles, HeartPulse, Baby];

export default function About() {
  const { site } = useSite();
  const a = site.about || {};
  const seo = site.seo || {};
  const sn = a.specialNeeds || {};

  return (
    <>
      <SEO
        title="About"
        description={a.story || a.bio}
        image={a.image}
        keywords={seo.keywords}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name: a.name,
          jobTitle: a.designation,
          description: a.story || a.bio,
        }}
      />
      <PageHero
        title={a.heroTitle || "About Dr. Sushma Appaiah"}
        subtitle={`${a.name} — ${a.designation}`}
        breadcrumb={["About"]}
        image={a.image}
      />

      {/* ================= STORY ================= */}
      <section className="section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="relative order-2 lg:order-1">
            <div className="absolute -left-5 top-5 h-40 w-40 rounded-3xl bg-sage/60" />
            <div className="absolute -bottom-6 -right-6 h-44 w-44 rounded-full bg-lime/15 blur-2xl" />
            {a.image && (
              <img src={a.image} alt={a.name} className="relative z-10 h-[360px] w-full rounded-[180px_180px_22px_22px] object-cover shadow-lift sm:h-[500px] lg:h-[600px]" loading="lazy" />
            )}
            <div className="glass absolute -bottom-7 left-10 z-20 rounded-[18px] px-7 py-4 shadow-card">
              <p className="font-heading text-2xl font-semibold text-primary">{a.experienceYears || 19}+</p>
              <p className="text-xs text-muted">Years of Experience</p>
            </div>
          </Reveal>
          <div className="order-1 lg:order-2">
            <SectionHeading center={false} eyebrow="The Story" title={a.name || "Your Nutritionist"} />
            <div className="mt-5 space-y-4 text-base leading-relaxed text-ink/75">
              {(a.story || "").split(/\n{2,}/).map((para) => (
                <p key={para.slice(0, 24)}>{para}</p>
              ))}
            </div>
            <p className="mt-6 rounded-[18px] border border-line bg-sage/50 p-6 text-[15px] leading-relaxed text-ink/75">
              <Quote size={20} className="mb-2 text-primary" />
              {a.approach}
            </p>
          </div>
        </div>
      </section>

      {/* ================= WHAT SHE HELPS WITH ================= */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="What She Helps With"
            title="A Practice Built Around You"
            subtitle="From metabolic conditions to family nutrition, every area of her work follows the same principle — nutrition that is personal."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {(a.helpGroups || []).map((group, gi) => {
              const Icon = HELP_ICONS[gi % HELP_ICONS.length];
              return (
                <Reveal key={group.title} delay={gi * 0.1}>
                  <div className="card h-full p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                        {Icon && <Icon size={24} />}
                      </span>
                      <h3 className="font-heading text-[19px] font-semibold text-ink">{group.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {(group.items || []).map((item) => (
                        <span key={item} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80 transition hover:border-primary hover:text-primary">
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= SPECIAL NEEDS ================= */}
      <section className="relative overflow-hidden bg-primary section-pad">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-sage/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-2">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink">
              <HeartPulse size={14} /> Core Specialisation
            </span>
            <h2 className="font-heading text-4xl font-semibold leading-tight text-[#EEF3EA] lg:text-[46px]">
              {sn.heading || "Nutrition for children with special needs"}
            </h2>
            <p className="mt-6 text-base leading-relaxed text-[#DBE6D5]/90">{sn.text}</p>
            <p className="mt-8 flex items-start gap-3 rounded-[18px] border border-lime/40 bg-white/5 px-6 py-4 text-sm font-medium leading-relaxed text-[#EEF3EA]">
              <BadgeCheck size={20} className="mt-0.5 shrink-0 text-lime" /> {sn.credibility}
            </p>
            <Link to="/contact" className="btn-gold mt-9 !bg-lime !text-ink hover:!bg-limeDark">
              {sn.ctaLabel || "Book a consultation for your child"} <ArrowRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[180px_180px_22px_22px] border border-white/15 bg-white/5 p-10 text-center lg:p-14">
              <p className="font-heading text-7xl font-semibold text-lime">
                <CountUp value={Number(sn.stat?.value || 3000)} suffix={sn.stat?.suffix || "+"} />
              </p>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-[#A9C0A0]">
                {sn.stat?.label || "diet plans delivered for children with special needs"}
              </p>
              <p className="mt-8 text-xs uppercase tracking-widest text-[#9FB4A5]">Through institutions like</p>
              <p className="mt-2 font-heading text-lg font-semibold text-[#EEF3EA]">AIISH, Mysore · Early-intervention school programs</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= CREDENTIALS ================= */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading eyebrow="Credentials" title="Formally Trained, Practically Experienced" />
          <div className="grid gap-5 sm:grid-cols-2">
            {(a.credentials || []).map((c, i) => (
              <Reveal key={c} delay={(i % 2) * 0.08}>
                <div className="card flex items-start gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                    <GraduationCap size={22} />
                  </span>
                  <p className="pt-1.5 text-sm font-medium leading-relaxed text-ink/80">{c}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ================= RECOGNITION ================= */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Recognition"
            title="Honoured For Impact Beyond The Clinic"
            subtitle="National and international recognition for her work in research, innovation and community health."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {(a.recognition || []).map((r, i) => (
              <Reveal key={r} delay={(i % 2) * 0.08}>
                <div className="card flex items-start gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-lime/15 text-limeDark">
                    <Award size={22} />
                  </span>
                  <p className="pt-1.5 text-sm font-medium leading-relaxed text-ink/80">{r}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-8 text-center">
            <p className="text-sm italic text-muted">{a.recognitionFootnote}</p>
          </Reveal>
        </div>
      </section>

      {/* ================= BEYOND THE CLINIC ================= */}
      <section className="section-pad">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <Reveal>
            <SectionHeading
              center={false}
              eyebrow="Beyond The Clinic"
              title="Shaping How Nutrition Is Taught In India"
            />
            <p className="text-base leading-relaxed text-ink/75">{a.beyondClinic}</p>
            <div className="mt-8 flex flex-wrap items-center gap-2.5">
              <span className="text-xs font-semibold uppercase tracking-widest text-muted">Life member —</span>
              {(a.affiliations || "AFSTI · Indian Dietetics Association (IDA) · Indian Nutritional Medical Association (INMA)")
                .split("·").map((af) => (
                  <span key={af} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80">
                    {af.trim()}
                  </span>
                ))}
            </div>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="card p-8">
              <div className="mb-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-lime text-ink"><Target size={24} /></span>
                <h3 className="font-heading text-[19px] font-semibold text-ink">Our Mission</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink/70">{a.mission}</p>
              <div className="mt-8 mb-6 flex items-center gap-3">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10 text-primary"><Eye size={24} /></span>
                <h3 className="font-heading text-[19px] font-semibold text-ink">Our Vision</h3>
              </div>
              <p className="text-sm leading-relaxed text-ink/70">{a.vision}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ================= STATS ================= */}
      <section className="section-pad pt-0">
        <div className="container-x">
          <Reveal className="grid grid-cols-2 gap-6 rounded-[24px] bg-primary p-8 shadow-lift sm:gap-8 sm:p-10 lg:grid-cols-4">
            {(a.stats || []).map((s) => (
              <div key={s.label} className="text-center">
                <p className="font-heading text-4xl font-semibold text-lime">
                  <CountUp value={Number(s.value)} suffix={s.suffix} />
                </p>
                <p className="mt-1.5 text-sm text-[#DBE6D5]/80">{s.label}</p>
              </div>
            ))}
          </Reveal>
          <Reveal className="mt-12 text-center">
            <Link to="/contact" className="btn-primary">
              Book a Consultation <ArrowRight size={18} />
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
