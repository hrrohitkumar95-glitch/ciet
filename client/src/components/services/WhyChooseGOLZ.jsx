import { HeartHandshake, ClipboardCheck, TrendingUp, Users } from "lucide-react";

const POINTS = [
  {
    Icon: ClipboardCheck,
    title: "Your history comes first",
    text: "We start with your medical history, labs, current medicines and daily food habits before a single goal is set.",
  },
  {
    Icon: Users,
    title: "One nutritionist, one plan",
    text: "You work with the same person throughout — not handed between departments, so nothing gets lost between visits.",
  },
  {
    Icon: TrendingUp,
    title: "Measured, then adjusted",
    text: "Progress is tracked against real markers, and the plan is refined as your body responds instead of running unchanged.",
  },
  {
    Icon: HeartHandshake,
    title: "Built to be sustainable",
    text: "No crash plans and no impossible rules. If a plan cannot fit your life, it is not the right plan for you.",
  },
];

const STATS = [
  { value: "19+", label: "Years of clinical practice" },
  { value: "5,000+", label: "Diet plans crafted" },
  { value: "1-on-1", label: "Personalised consultations" },
];

/** "Why Choose GOLZ" — the credibility section beneath the grid. */
export default function WhyChooseGOLZ() {
  return (
    <section className="bg-primary section-pad" aria-labelledby="why-golz-heading">
      <div className="container-x">
        <div className="max-w-2xl">
          <span className="inline-flex items-center rounded-full border border-lime/40 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-lime">
            Why Choose GOLZ
          </span>
          <h2
            id="why-golz-heading"
            className="mt-5 font-heading text-3xl font-semibold leading-tight text-[#EEF3EA] sm:text-4xl lg:text-[44px] lg:leading-[1.12]"
          >
            Nutrition care you can trust, built around a real person
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[#C3D4BE]">
            GOLZ (Giggles of Livez) was created so that clinical nutrition could feel warm, clear and genuinely
            personal — the kind of guidance people can follow for years, not weeks.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          {POINTS.map(({ Icon, title, text }) => (
            <div
              key={title}
              className="flex gap-4 rounded-[20px] border border-white/15 bg-white/[0.06] p-6 transition-colors duration-300 hover:bg-white/[0.1] sm:p-7"
            >
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-lime text-ink">
                <Icon size={22} aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <h3 className="font-heading text-[19px] font-semibold leading-snug text-[#EEF3EA]">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-[#A9C0A0]">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <dl className="mt-12 grid gap-6 border-t border-white/15 pt-10 sm:grid-cols-3">
          {STATS.map((stat) => (
            <div key={stat.label}>
              <dt className="sr-only">{stat.label}</dt>
              <dd>
                <span className="block font-heading text-3xl font-semibold text-lime sm:text-4xl">{stat.value}</span>
                <span className="mt-1.5 block text-sm text-[#A9C0A0]">{stat.label}</span>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
