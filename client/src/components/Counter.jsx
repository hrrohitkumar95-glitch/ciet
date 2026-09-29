import { useEffect, useRef, useState } from "react";

/** Animated count-up that starts when scrolled into view. */
export default function Counter({ value, suffix = "", duration = 1600, decimals = 0 }) {
  const [display, setDisplay] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = null;
    const run = () => {
      if (started.current) return;
      started.current = true;
      if (frame) cancelAnimationFrame(frame);
      const start = performance.now();
      const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = value * (1 - Math.pow(1 - p, 3));
        setDisplay(decimals > 0 ? Number(eased.toFixed(decimals)) : Math.round(eased));
        if (p < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    };

    const obs =
      typeof IntersectionObserver === "function"
        ? new IntersectionObserver(
            ([entry]) => {
              if (entry.isIntersecting) run();
            },
            { threshold: 0.4 }
          )
        : null;
    obs?.observe(el);

    /* Safety net: never leave a statistic stranded on 0. If the observer
       never fires (no scroll, unsupported/disabled IO, element already
       skipped) the value is animated in shortly after mount anyway. */
    const fallback = setTimeout(run, 1200);

    return () => {
      obs?.disconnect();
      clearTimeout(fallback);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, duration, decimals]);

  return (
    <span ref={ref}>
      {display.toLocaleString("en-IN", {
        minimumFractionDigits: decimals > 0 ? decimals : 0,
        maximumFractionDigits: decimals > 0 ? decimals : 0,
      })}
      {suffix}
    </span>
  );
}
