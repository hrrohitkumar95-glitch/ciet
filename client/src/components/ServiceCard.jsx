import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Clock } from "lucide-react";
import { ICON_MAP } from "../utils/helpers";
import LazyImage from "./LazyImage";

export default function ServiceCard({ service }) {
  const navigate = useNavigate();
  const Icon = ICON_MAP.get(service.icon) || ICON_MAP.get("Sparkles");

  return (
    <article className="card group flex h-full flex-col overflow-hidden hover:-translate-y-2 hover:shadow-lift">
      {service.image && (
        <Link to={`/services/${service.slug}`} className="relative block h-48 overflow-hidden">
          <LazyImage src={service.image} alt={service.title} imgClassName="group-hover:scale-110 transition-transform duration-700" className="h-full w-full" />
          <span className="absolute left-4 top-4 flex h-11 w-11 items-center justify-center rounded-xl bg-white/95 text-primary shadow-soft backdrop-blur">
            {Icon && <Icon size={22} />}
          </span>
        </Link>
      )}
      <div className="flex flex-1 flex-col p-6">
        {!service.image && (
          <span className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            {Icon && <Icon size={24} />}
          </span>
        )}
        <h3 className="mb-2 font-heading text-xl font-semibold text-charcoal">
          <Link to={`/services/${service.slug}`} className="transition group-hover:text-primary">{service.title}</Link>
        </h3>
        <p className="mb-4 flex-1 text-sm leading-relaxed text-charcoal/60">{service.shortDesc}</p>
        {service.duration && (
          <span className="mb-4 inline-flex items-center gap-1.5 text-xs font-medium text-charcoal/50">
            <Clock size={13} /> {service.duration}
          </span>
        )}
        <div className="flex items-center gap-3">
          <Link to={`/services/${service.slug}`} className="inline-flex items-center gap-2 font-body text-sm font-semibold text-primary">
            Read More <ArrowRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
          <button
            onClick={() => navigate(`/contact?service=${encodeURIComponent(service.title)}`)}
            className="ml-auto rounded-full bg-primary/10 px-4 py-2 font-body text-xs font-semibold text-primary transition hover:bg-primary hover:text-white"
          >
            Book Consultation
          </button>
        </div>
      </div>
    </article>
  );
}
