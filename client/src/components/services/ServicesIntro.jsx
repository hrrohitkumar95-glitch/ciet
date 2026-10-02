/** Short editorial introduction above the services grid. */
export default function ServicesIntro({
  eyebrow = "What We Offer",
  title = "Care that meets you where you are",
  text = "Every plan begins with your history, your labs and your real routine — not a generic chart. Whether the goal is steady blood sugar, a healthier pregnancy, better sport performance or support through treatment, the approach is the same: understand the person first, then build the plan.",
}) {
  return (
    <section className="bg-white section-pad">
      <div className="container-x">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-limeDark">{eyebrow}</span>
            <h2 className="mt-4 font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[42px] lg:leading-[1.12]">
              {title}
            </h2>
          </div>
          <p className="text-base leading-[1.8] text-muted lg:pt-10">{text}</p>
        </div>
      </div>
    </section>
  );
}
