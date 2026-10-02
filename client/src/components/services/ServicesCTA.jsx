import { Link } from "react-router-dom";
import { CalendarCheck, MessageCircle } from "lucide-react";

/** Closing consultation call to action. */
export default function ServicesCTA() {
  return (
    <section className="bg-cream section-pad" aria-labelledby="services-cta-heading">
      <div className="container-x">
        <div className="mx-auto max-w-2xl text-center">
          <h2
            id="services-cta-heading"
            className="font-heading text-3xl font-semibold leading-tight text-ink sm:text-4xl lg:text-[42px] lg:leading-[1.12]"
          >
            Ready to start your personalized wellness journey?
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-muted">
            Book a consultation and let us understand your health, your routine and your goals. You will leave
            with a clear direction — whether or not you decide to continue with us.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/contact" className="btn-primary w-full sm:w-auto sm:min-w-[220px]">
              <CalendarCheck size={19} aria-hidden="true" />
              Book Consultation
            </Link>
            <Link to="/contact" className="btn-outline w-full sm:w-auto sm:min-w-[220px]">
              <MessageCircle size={18} aria-hidden="true" />
              Ask a Question
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
