import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { ICON_MAP } from "../../utils/helpers";

/**
 * A single service card. The cover image is decorative here — if it is missing
 * or fails to load the card falls back to its icon tile, so one bad URL can
 * never produce a broken image or an unstable card height.
 */
export default function ServiceCard({ service }) {
  const [imageFailed, setImageFailed] = useState(false);
  const Icon = ICON_MAP.get(service.icon) || ICON_MAP.get("Sparkles");
  const showImage = Boolean(service.image) && !imageFailed;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-[22px] border border-line bg-white transition duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-soft focus-within:-translate-y-1 focus-within:shadow-soft motion-reduce:transform-none">
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-sage">
        {showImage ? (
          <img
            src={service.image}
            alt={`${service.title} — nutrition service`}
            loading="lazy"
            decoding="async"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover transition-transform duration-700 motion-reduce:transform-none group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-sage" aria-hidden="true">
            {Icon ? <Icon size={40} className="text-primary/45" /> : null}
          </div>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ink/45 to-transparent" aria-hidden="true" />

        {Icon ? (
          <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white/95 text-primary shadow-soft">
            <Icon size={22} aria-hidden="true" />
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-6 sm:p-7">
        {service.category ? (
          <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-limeDark">{service.category}</span>
        ) : null}

        <h3 className={`${service.category ? "mt-2.5" : ""} font-heading text-[21px] font-semibold leading-snug text-ink`}>
          {service.title}
        </h3>

        {service.shortDesc ? (
          <p className="mt-3 text-[15px] leading-relaxed text-muted">{service.shortDesc}</p>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-4 pt-6">
          {service.duration ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted">
              <Clock size={14} aria-hidden="true" />
              {service.duration}
            </span>
          ) : (
            <span />
          )}

          <Link
            to={`/services/${service.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg text-sm font-semibold text-primary after:absolute after:inset-0 after:content-[''] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 focus-visible:ring-offset-2"
            aria-label={service.title ? `View details for ${service.title}` : "View service details"}
          >
            View details
            <ArrowRight
              size={16}
              aria-hidden="true"
              className="transition-transform duration-300 motion-reduce:transform-none group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}
