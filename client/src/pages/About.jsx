import { Link } from "react-router-dom";
import {
  ArrowRight,
  Award,
  BadgeCheck,
  Baby,
  CalendarCheck,
  CheckCircle2,
  Eye,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  Leaf,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
  UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";
import { useSite } from "../context/SiteContext";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import SectionHeading from "../components/SectionHeading";

/* ---------------------------------------------------------------------------
   Verified fallback content — mirrors the seeded GOLZ About data so the page
   always renders fully even before (or without) the CMS payload, and never
   shows "undefined" / blank values.
--------------------------------------------------------------------------- */
const FB = {
  name: "Dr. Sushma Appaiah",
  designation: "Founder & Nutrition Scientist, GOLZ",
  role: "Nutritionist",
  image: "/doctor-portrait.png",
  experienceYears: 19,
  story:
    "Dr. Sushma Appaiah is the Founder of GOLZ (Giggles of Livez) and a distinguished nutrition scientist with 19 years of experience in clinical nutrition, corporate wellness, and health counselling. She holds a Ph.D. in Food Science & Technology from CSIR-CFTRI, Mysore, and an M.Sc. in Food & Nutrition (2nd Rank) from the University of Mysore. Over the years, she has helped clients across 13 countries achieve sustainable health through evidence-based nutrition and personalized care.",
  approach:
    "Since founding GOLZ in Mysore in 2015, the philosophy has never changed: nutrition should be personal. She doesn't hand out generic meal charts — she reads the individual, their condition, their labs, and builds a plan that fits their life. That approach has helped thousands reverse diabetes, manage PCOS and thyroid issues, recover from illness, and simply feel better.",
  focusAreas: [
    { title: "Personalised Nutrition", text: "Plans built around the individual — your body, health context, labs and lifestyle." },
    { title: "Evidence-Informed Practice", text: "Guidance grounded in established food science and professional nutrition practice." },
    { title: "Family Nutrition", text: "Practical eating that works for the whole household, not just one person." },
    { title: "Children's Nutrition", text: "Gentle, age-appropriate nutrition for growth, behaviour and long-term health." },
    { title: "Special Nutritional Needs", text: "Carefully adapted support for autism, ADHD and developmental needs." },
    { title: "Sustainable Lifestyle Changes", text: "Changes designed to last beyond a short-term diet — not quick fixes." },
  ],
  philosophy: [
    { icon: "Sparkles", title: "Personalised", text: "Nutrition plans built around the individual." },
    { icon: "UtensilsCrossed", title: "Practical", text: "Recommendations designed for real everyday life." },
    { icon: "Leaf", title: "Sustainable", text: "Changes that can be maintained beyond a short-term diet." },
    { icon: "ShieldCheck", title: "Evidence-Informed", text: "Nutrition guidance grounded in established knowledge and professional practice." },
  ],
  specialUses: 5000,
  specialText:
    "Specialised child nutrition is at the heart of Dr. Sushma's work. GLOZ provides personalised nutrition support for children with special nutritional requirements and their families — building gentle, practical plans that work with a child's sensitivities, not against them.",
  specialCredibility: "Certified in Autism & ADHD Nutrition Therapy, Level 1 & 2 — Cambridge International Institute, UK",
  specialCta: "Book a consultation for your child",
  impact: [
    { value: 19, suffix: "+", label: "Years Experience" },
    { value: 15000, suffix: "+", label: "Programs Completed" },
    { value: 5000, suffix: "+", label: "Diet Plans Delivered" },
    { value: 3000, suffix: "+", label: "Plans for Special Kids" },
  ],
  helpGroups: [
    {
      title: "Metabolic & Lifestyle",
      items: [
        "Diabetes reversal",
        "PCOS",
        "Thyroid",
        "Weight management",
        "Onco (cancer recovery)",
        "Sports nutrition",
        "Stress & mental wellbeing",
      ],
    },
    {
      title: "Life-stage & Family",
      items: ["Pregnancy, GDM & lactation", "Autism & ADHD child nutrition", "Nutrigenomics"],
    },
  ],
  timeline: [
    { year: "2007", title: "Began Clinical Practice", text: "Started her journey in clinical nutrition and food science after completing M.Sc. with 2nd Rank at the University of Mysore." },
    { year: "2012", title: "Ph.D. from CSIR-CFTRI", text: "Completed doctoral research in Food Science & Technology at India's premier food research institute." },
    { year: "2015", title: "Founded GOLZ", text: "Launched GOLZ (Giggles of Livez) in Mysuru with a vision of joyful, personalized nutrition care." },
    { year: "2019", title: "15,000+ Programs Milestone", text: "Crossed 15,000 nutrition & health programs completed for clients across India and beyond." },
    { year: "2022", title: "Clients Across 13 Countries", text: "Expanded online consultations, serving clients worldwide with precision, DNA-personalized nutrition." },
    { year: "2025", title: "National Recognition", text: "Honored as the Most Innovative Nutrition Counsellor of the Year." },
  ],
  research: "Nutrition research translated into everyday practice — from food science at CSIR-CFTRI to 15+ peer-reviewed papers and UGC-approved nutrition programs.",
  reversal: "Nutrition plans designed to support the management of diabetes, thyroid, PCOS and other lifestyle conditions through evidence-based dietary intervention.",
  innovation: "UGC-approved nutrition programs and 250+ invited talks shaping nutrition education across India.",

  trained: [
    { icon: "GraduationCap", title: "Professional Knowledge", text: "Evidence-informed nutrition practice and structured assessment." },
    { icon: "Users", title: "Practical Experience", text: "Individualised nutrition strategies designed around real-world needs." },
    { icon: "HeartHandshake", title: "Personalised Care", text: "Plans adapted to the person rather than forcing the person into a fixed diet." },
  ],
  credentials: [
    "Ph.D, Food Science & Technology — CSIR-CFTRI, Mysore",
    "M.Sc, Food & Nutrition (2nd Rank) — University of Mysore",
    "Advanced Nutrigenomics Expert — Genebox Academy",
    "Autism & ADHD Nutrition Therapy, Level 1 & 2 — Cambridge International Institute, UK",
    "19 years in personalised nutrition counselling",
  ],
  recognition: [
    "DST Women Scientist Awardee — Govt. of India",
    "Most Innovative Nutrition Counsellor of the Year — New Delhi",
    "Women Achiever Entrepreneur, Impacting Global Health — Ministry of Science & Technology (IISF 2020)",
    "Changemaker Award — for serving 800+ COVID patients and frontline workers",
  ],
  recognitionFootnote: "…among 10+ national and international honours.",
  affiliations: "AFSTI · Indian Dietetics Association (IDA) · Indian Nutritional Medical Association (INMA)",
  glozFocus: [
    "Personalised nutrition",
    "Family nutrition",
    "Children's nutrition",
    "Special nutritional needs",
    "Practical lifestyle changes",
    "Long-term wellbeing",
  ],
  mission: "To make evidence-based nutrition simple, accessible and enjoyable — so every client can achieve lasting health without deprivation or fad diets.",
  vision: "A world where personalized nutrition is the first line of defence against lifestyle disease, not the last resort.",
  beyondClinic:
    "Beyond her practice, Dr. Sushma shapes how nutrition is taught in India — developing UGC-approved nutrition programs, convening the Indian Dietetics Association's Mysore chapter, delivering 250+ invited talks and publishing 15+ peer-reviewed papers, alongside her broader contribution to nutrition education and community impact.",
  beyondClinicHighlights: [
    "Developed UGC-approved nutrition programs",
    "Convenes the Indian Dietetics Association's Mysore chapter",
    "250+ invited talks delivered across India",
    "15+ peer-reviewed papers published",
    "Coordinated nutrition training for 20,000+ Anganwadi and ASHA workers",
  ],
};

const ICONS = {
  Sparkles,
  UtensilsCrossed,
  Leaf,
  ShieldCheck,
  GraduationCap,
  Users,
  HeartHandshake,
};

const HELP_ICONS = [Sparkles, HeartPulse, Baby];

function Icon({ name, size = 22, className = "" }) {
  const Cmp = ICONS[name] || Sparkles;
  return <Cmp size={size} className={className} />;
}

/* ---------------------------------------------------------------------------
   Safe numeric atom — renders the true, formatted value directly so a
   statistic is never blank, "0" or "NaN" while any animation is pending.
--------------------------------------------------------------------------- */
const NF = new Intl.NumberFormat("en-IN");

function SafeStat({ value, suffix = "" }) {
  const n = Number(value);
  const safe = Number.isFinite(n) ? n : 0;
  return (
    <motion.span initial={{ opacity: 0, y: 8 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
      {NF.format(safe)}
      {suffix}
    </motion.span>
  );
}

export default function About() {
  const { site } = useSite();
  const a = site.about || {};

  const name = a.name || FB.name;
  const designation = a.designation || FB.designation;
  const image = a.image || FB.image;
  const experienceYears = Number(a.experienceYears) > 0 ? Number(a.experienceYears) : FB.experienceYears;

  const story = a.story?.trim() || FB.story;
  const approach = a.approach?.trim() || FB.approach;
  const focusAreas = Array.isArray(a.focusAreas) && a.focusAreas.length ? a.focusAreas : FB.focusAreas;
  const philosophy = Array.isArray(a.philosophy) && a.philosophy.length ? a.philosophy : FB.philosophy;
  const trained = Array.isArray(a.trained) && a.trained.length ? a.trained : FB.trained;
  const credentials = Array.isArray(a.credentials) && a.credentials.length ? a.credentials : FB.credentials;
  const recognition = Array.isArray(a.recognition) && a.recognition.length ? a.recognition : FB.recognition;
  const recognitionFootnote = a.recognitionFootnote?.trim() || FB.recognitionFootnote;
  const affiliations = (a.affiliations?.trim() || FB.affiliations).split("·").map((s) => s.trim()).filter(Boolean);
  const glozFocus = Array.isArray(a.glozFocus) && a.glozFocus.length ? a.glozFocus : FB.glozFocus;
  const helpGroups = Array.isArray(a.helpGroups) && a.helpGroups.length ? a.helpGroups : FB.helpGroups;
  const timeline = Array.isArray(a.timeline) && a.timeline.length ? a.timeline : FB.timeline;
  const impactStats = Array.isArray(a.stats) && a.stats.length ? a.stats : FB.impact;
  const researchLine = a.beyondClinic?.trim()
    ? a.beyondClinic.split(".")[0].trim() + "."
    : FB.research;
  const mission = a.mission?.trim() || FB.mission;
  const vision = a.vision?.trim() || FB.vision;
  const beyondClinic = a.beyondClinic?.trim() || FB.beyondClinic;
  const beyondClinicHighlights =
    Array.isArray(a.beyondClinicHighlights) && a.beyondClinicHighlights.length
      ? a.beyondClinicHighlights
      : FB.beyondClinicHighlights;

  const sn = (site.about && site.about.specialNeeds) || {};
  /* The specialisation stat is fixed at 5,000+ to stay consistent with the
     impact figure, so the section copy is the approved 5,000+ wording rather
     than the legacy CMS paragraph (which quoted the old 3,000 plan count). */
  const specialText = FB.specialText;
  const specialCredibility = sn.credibility?.trim() || FB.specialCredibility;
  const specialCta = sn.ctaLabel?.trim() || FB.specialCta;
  const specialUses = FB.specialUses;

  const seoDescription =
    "Learn about GLOZ (Giggles of Livez), Dr. Sushma Appaiah, and our personalised approach to nutrition for individuals, families and children.";

  return (
    <>
      <SEO
        title="About GLOZ"
        description={seoDescription}
        image={image}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Person",
          name,
          jobTitle: designation,
          description: name + " — " + designation,
        }}
      />

      {/* ============================ HERO ============================ */}
      <section className="relative overflow-hidden bg-primary pb-16 pt-[104px] sm:pb-20 lg:pt-[116px]">
        <div className="absolute -left-24 top-6 h-80 w-80 rounded-full bg-sage/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-lime/15 blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10">
          <div className="mx-auto max-w-3xl py-6 text-center sm:py-10">
            <Reveal>
              <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-lime">
                About GLOZ
              </span>
              <h1 className="font-heading text-4xl font-semibold leading-tight text-[#EEF3EA] sm:text-5xl lg:text-[60px] lg:leading-[1.05]">
                Nutrition That Understands You
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-[#DBE6D5]/85 sm:text-lg">
                Personalised nutrition built around your body, your needs, your lifestyle, and your goals.
              </p>
              <p className="mt-5 font-heading text-lg font-semibold text-lime sm:text-xl">
                {name} <span className="text-[#DBE6D5]/60">—</span> {designation}
              </p>
              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <Link to="/contact" className="btn-lime !px-8">
                  <CalendarCheck size={19} /> Book a Consultation <ArrowRight size={18} />
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-10 flex flex-wrap items-center justify-center gap-2.5">
                {["Personalised", "Evidence-informed", "Family-centred", "Sustainable"].map((tag) => (
                  <span
                    key={tag}
                    className="flex items-center gap-1.5 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-[#DBE6D5]/90"
                  >
                    <CheckCircle2 size={14} className="text-lime" /> {tag}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== MEET THE NUTRITIONIST ============== */}
      <section className="section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <Reveal className="relative mx-auto w-full max-w-md">
            <div className="absolute -left-5 top-6 h-40 w-40 rounded-3xl bg-sage/70" aria-hidden="true" />
            <div className="absolute -bottom-6 -right-5 h-44 w-44 rounded-full bg-lime/15 blur-2xl" aria-hidden="true" />
            {image ? (
              <img
                src={image}
                alt={name}
                className="relative z-10 h-[380px] w-full rounded-[180px_180px_24px_24px] object-cover object-top shadow-lift sm:h-[460px] lg:h-[560px]"
                loading="lazy"
              />
            ) : (
              <div className="relative z-10 flex h-[380px] w-full items-center justify-center rounded-[180px_180px_24px_24px] bg-sage sm:h-[460px]">
                <span className="text-center font-heading text-2xl font-semibold text-primary">GLOZ</span>
              </div>
            )}
            <div className="glass absolute -bottom-7 left-6 z-20 rounded-[18px] px-6 py-4 shadow-card">
              <p className="font-heading text-3xl font-semibold text-primary">
                {experienceYears}+
              </p>
              <p className="text-xs font-medium text-muted">Years of Experience</p>
            </div>
          </Reveal>

          <div>
            <SectionHeading
              center={false}
              eyebrow="Meet The Nutritionist"
              title="About Dr. Sushma Appaiah"
            />
            <Reveal>
              <p className="mt-5 text-base leading-relaxed text-ink/85">
                Dr. Sushma Appaiah believes nutrition is not about following restrictive diets or
                temporary trends — it is about understanding the individual, identifying the factors
                influencing their health, and creating practical strategies that can become part of
                everyday life.
              </p>
              <p className="mt-4 text-base leading-relaxed text-ink/75">{approach}</p>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {focusAreas.map((f, i) => (
                <Reveal key={f.title} delay={(i % 2) * 0.08}>
                  <div className="card h-full p-5">
                    <div className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                        <BadgeCheck size={17} />
                      </span>
                      <div>
                        <h3 className="font-heading text-[16px] font-semibold text-ink">{f.title}</h3>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-muted">{f.text}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============== THE STORY ============== */}
      <section className="bg-cream section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              The Story
            </span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              Your Nutritionist
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink/80">{story}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="relative rounded-[24px] border border-line bg-white p-8 shadow-card sm:p-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-lime text-ink">
                <Quote size={22} />
              </span>
              <p className="mt-6 font-heading text-xl font-medium leading-relaxed text-primary sm:text-[22px]">
                "Nutrition should be personal. We read the individual — their condition, their labs,
                their life — and build a plan that fits."
              </p>
              <p className="mt-6 text-sm font-semibold text-ink">— {name}</p>
              <p className="mt-1 text-sm text-muted">{designation}</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== THE APPROACH ============== */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="The Approach"
            title="A Practice Built Around You"
            subtitle="From metabolic conditions to family nutrition, every area of our work follows the same principle — nutrition that fits your life."
          />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {philosophy.map((p, i) => (
              <Reveal key={p.title} delay={(i % 4) * 0.08}>
                <div className="card h-full p-7 text-center">
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-primary/10 text-primary">
                    <Icon name={p.icon} size={26} />
                  </span>
                  <h3 className="mt-5 font-heading text-[19px] font-semibold text-ink">{p.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== WHAT SHE HELPS WITH ============== */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="What She Helps With"
            title="A Practice Built Around You"
            subtitle="From metabolic conditions to family nutrition, every area of her work follows the same principle — nutrition that is personal."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {helpGroups.map((group, gi) => {
              const GroupIcon = HELP_ICONS[gi % HELP_ICONS.length];
              return (
                <Reveal key={group.title} delay={gi * 0.1}>
                  <div className="card h-full p-8">
                    <div className="mb-6 flex items-center gap-4">
                      <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                        {GroupIcon && <GroupIcon size={24} />}
                      </span>
                      <h3 className="font-heading text-[19px] font-semibold text-ink">{group.title}</h3>
                    </div>
                    <div className="flex flex-wrap gap-2.5">
                      {(group.items || []).map((item) => (
                        <span
                          key={item}
                          className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80 transition hover:border-primary hover:text-primary"
                        >
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

      {/* ============== CORE SPECIALISATION ============== */}
      <section className="relative overflow-hidden bg-primary section-pad">
        <div className="absolute -right-32 top-0 h-96 w-96 rounded-full bg-sage/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-lime/10 blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10 grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="mb-6 inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-ink">
              <Target size={14} /> Core Specialisation
            </span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#EEF3EA] sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              Nutrition for children with special needs
            </h2>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-[#DBE6D5]/90">{specialText}</p>
            <p className="mt-8 flex items-start gap-3 rounded-[18px] border border-lime/40 bg-white/5 px-6 py-4 text-sm font-medium leading-relaxed text-[#EEF3EA]">
              <BadgeCheck size={20} className="mt-0.5 shrink-0 text-lime" /> {specialCredibility}
            </p>
            <Link to="/contact" className="btn-lime mt-9">
              <CalendarCheck size={18} /> {specialCta} <ArrowRight size={18} />
            </Link>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[180px_180px_24px_24px] border border-white/15 bg-white/5 p-10 text-center lg:p-14">
              <p className="font-heading text-7xl font-semibold leading-none text-lime sm:text-8xl">
                <SafeStat value={specialUses} suffix="+" />
              </p>
              <p className="mx-auto mt-4 max-w-xs text-sm leading-relaxed text-[#A9C0A0]">
                Lives supported through personalised nutrition and family-focused care
              </p>
              <div className="mx-auto mt-8 h-px w-16 bg-lime/40" />
              <p className="mt-6 text-xs uppercase tracking-widest text-[#9FB4A5]">Through institutions like</p>
              <p className="mt-2 font-heading text-lg font-semibold text-[#EEF3EA]">
                AIISH, Mysore · Early-intervention school programs
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== IMPACT ============== */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Impact"
            title="A Track Record That Speaks For Itself"
            subtitle="Measurable results across years, programs and countries — grounded in verified practice, not promises."
          />
          <Reveal className="grid grid-cols-2 gap-6 rounded-[24px] bg-primary p-8 shadow-lift sm:gap-8 sm:p-12 lg:grid-cols-4">
            {impactStats.map((s) => (
              <div key={s.label} className="mx-auto w-full max-w-xs text-center">
                <p className="font-heading text-4xl font-semibold text-lime sm:text-5xl">
                  <SafeStat value={s.value} suffix={s.suffix} />
                </p>
                <p className="mt-2 text-sm text-[#DBE6D5]/85">{s.label}</p>
              </div>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ============== FORMALLY TRAINED ============== */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Training & Experience"
            title="Formally Trained. Practically Experienced"
            subtitle="Nurturing Nutrition academically — a balance of professional nutrition knowledge and hands-on experience with individuals and families."
          />
          <div className="grid gap-6 md:grid-cols-3">
            {trained.map((t, i) => (
              <Reveal key={t.title} delay={(i % 3) * 0.08}>
                <div className="card h-full p-7">
                  <span className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
                    <Icon name={t.icon} size={26} />
                  </span>
                  <h3 className="mt-5 font-heading text-[20px] font-semibold text-ink">{t.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{t.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal className="mt-10">
            <div className="grid gap-3 rounded-[24px] border border-line bg-white p-6 sm:grid-cols-2 sm:p-8">
              {credentials.map((c) => (
                <div key={c} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
                    <GraduationCap size={17} />
                  </span>
                  <p className="pt-1 text-sm font-medium leading-relaxed text-ink/80">{c}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== RECOGNITION ============== */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Recognitions"
            title="Honoured For Impact Beyond The Clinic"
            subtitle="National and international recognition for work in research, innovation and community health."
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {recognition.map((r, i) => (
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
          {(affiliations.length > 0 || recognitionFootnote) && (
            <Reveal className="mt-8">
              <div className="flex flex-col items-center gap-5">
                {affiliations.length > 0 && (
                  <div className="flex flex-wrap items-center justify-center gap-2.5">
                    <span className="text-xs font-semibold uppercase tracking-widest text-muted">Life member —</span>
                    {affiliations.map((af) => (
                      <span key={af} className="rounded-full border border-line bg-white px-4 py-2 text-sm font-medium text-ink/80">
                        {af || "Member"}
                      </span>
                    ))}
                  </div>
                )}
                {recognitionFootnote && (
                  <p className="text-center text-sm italic text-muted">{recognitionFootnote}</p>
                )}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ============== ABOUT GLOZ ============== */}
      <section className="bg-cream section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <span className="mb-3 inline-block rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-primary">
              About GLOZ
            </span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[44px] lg:leading-[1.1]">
              GLOZ <span className="text-primary">(Giggles of Livez)</span>
            </h2>
            <p className="mt-6 text-base leading-relaxed text-ink/80">
              GLOZ (Giggles of Livez) is a personalised nutrition practice focused on helping
              individuals and families build healthier, more sustainable relationships with food
              and wellbeing.
            </p>
            <p className="mt-4 text-base leading-relaxed text-ink/75">
              Where the doctor represents the expertise and philosophy behind the care, GLOZ is the
              practice itself — the way that care is delivered, the approach it takes, and the
              impact it creates for the people and families it serves.
            </p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="card p-8 sm:p-10">
              <h3 className="flex items-center gap-3 font-heading text-[19px] font-semibold text-ink">
                <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Leaf size={22} />
                </span>
                What GLOZ Focuses On
              </h3>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {glozFocus.map((item) => (
                  <div key={item} className="flex items-center gap-2.5 rounded-[14px] border border-line bg-paper px-4 py-3">
                    <CheckCircle2 size={17} className="shrink-0 text-primary" />
                    <span className="text-sm font-medium text-ink/85">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== MISSION & VISION ============== */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Purpose"
            title="Our Mission & Vision"
          />
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal>
              <div className="card h-full p-8 sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-lime/15 text-limeDark">
                  <Target size={24} />
                </span>
                <h3 className="mt-5 font-heading text-[22px] font-semibold text-ink">Our Mission</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{mission}</p>
              </div>
            </Reveal>
            <Reveal delay={0.12}>
              <div className="card h-full p-8 sm:p-10">
                <span className="flex h-12 w-12 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Sparkles size={24} />
                </span>
                <h3 className="mt-5 font-heading text-[22px] font-semibold text-ink">Our Vision</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-ink/75">{vision}</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== BEYOND THE CLINIC ============== */}
      <section className="bg-section-sage section-pad">
        <div className="container-x grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <Reveal>
            <SectionHeading
              center={false}
              eyebrow="Beyond The Clinic"
              title="Shaping How Nutrition Is Taught In India"
            />
            <p className="-mt-4 text-base leading-relaxed text-ink/75">{beyondClinic}</p>
          </Reveal>
          <Reveal delay={0.12}>
            <div className="card p-8 sm:p-9">
              <h3 className="font-heading text-[19px] font-semibold text-ink">Contribution To Nutrition Education & Community Health</h3>
              <ul className="mt-6 space-y-4">
                {beyondClinicHighlights.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-[9px] bg-lime/15 text-limeDark">
                      <CheckCircle2 size={16} />
                    </span>
                    <span className="text-sm font-medium leading-relaxed text-ink/80">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============== RESEARCH · REVERSAL · INNOVATION ============== */}
      <section className="section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Research · Reversal · Innovation"
            title="Science That Reaches The Plate"
            subtitle="Three commitments that define how Dr. Sushma practises nutrition."
          />
          <div className="grid gap-6 lg:grid-cols-3">
            <Reveal>
              <div className="card flex h-full items-start gap-4 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Sparkles size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-[19px] font-semibold text-ink">Research</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{researchLine}</p>
                </div>
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="card flex h-full items-start gap-4 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Target size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-[19px] font-semibold text-ink">Reversal of disease</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{FB.reversal}</p>
                </div>
              </div>
            </Reveal>
            <Reveal>
              <div className="card flex h-full items-start gap-4 p-6">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                  <Award size={22} />
                </span>
                <div className="flex-1">
                  <h3 className="font-heading text-[19px] font-semibold text-ink">Innovation</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink/70">{FB.innovation}</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============== OUR JOURNEY ============== */}
      <section className="bg-section-sage section-pad">
        <div className="container-x">
          <SectionHeading
            eyebrow="Our Journey"
            title="Precious Moments"
            subtitle="Milestones from Dr. Sushma's practice — from clinical nutrition in 2007 to national recognition."
          />
          <div className="grid gap-6 lg:grid-cols-2">
            {timeline.map((t, i) => (
              <Reveal key={t.year} delay={(i % 3) * 0.08}>
                <div className="card flex h-full items-start gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] bg-primary/10 text-primary">
                    <Eye size={22} />
                  </span>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <h3 className="font-heading text-[19px] font-semibold text-ink">{t.year}</h3>
                      <p className="font-heading text-[15px] font-semibold text-primary">{t.title}</p>
                    </div>
                    {t.text && <p className="mt-2 text-sm leading-relaxed text-ink/70">{t.text}</p>}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============== FINAL CTA ============== */}
      <section className="relative overflow-hidden bg-primary section-pad">
        <div className="absolute -left-24 top-0 h-80 w-80 rounded-full bg-sage/10 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-20 bottom-0 h-72 w-72 rounded-full bg-lime/15 blur-3xl" aria-hidden="true" />
        <div className="container-x relative z-10">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-lime/40 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-lime">
              Get Started
            </span>
            <h2 className="font-heading text-3xl font-semibold leading-tight text-[#EEF3EA] sm:text-4xl lg:text-[46px] lg:leading-[1.1]">
              Let's Build A Healthier Relationship With Nutrition
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-[#DBE6D5]/85 sm:text-lg">
              Personalised guidance starts with understanding you.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link to="/contact" className="btn-lime !px-9">
                <CalendarCheck size={19} /> Book a Consultation <ArrowRight size={18} />
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}