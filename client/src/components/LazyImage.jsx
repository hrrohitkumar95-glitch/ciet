import { useState } from "react";

/**
 * Lazy image with fade-in and blur-up placeholder, plus a built-in fallback for
 * a missing or broken source.
 *
 * `natural` keeps the image's own aspect ratio instead of cropping it.
 * `srcSet`/`sizes`/`loading` are passed straight through so callers can let the
 * browser fetch a right-sized file; they default to the previous lazy behaviour.
 */
export default function LazyImage({
  src,
  alt = "",
  className = "",
  imgClassName = "",
  natural = false,
  srcSet,
  sizes,
  loading = "lazy",
}) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  if (broken || typeof src !== "string" || !src) {
    return (
      <div className={`flex flex-col items-center justify-center gap-1 bg-charcoal/5 text-center ${className}`}>
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="text-charcoal/35" aria-hidden="true">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="9" cy="9" r="2" />
          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
        </svg>
        <span className="text-xs font-medium text-charcoal/45">Image unavailable</span>
      </div>
    );
  }
  return (
    <div className={`overflow-hidden ${className}`}>
      <img
        src={src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        alt={alt}
        loading={loading}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setBroken(true)}
        className={`transition-all duration-700 ${loaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"} ${natural ? "h-auto w-full object-contain" : "h-full w-full object-cover"} ${imgClassName}`}
      />
    </div>
  );
}
