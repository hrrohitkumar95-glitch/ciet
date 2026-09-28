import { useEffect, useRef, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Play } from "lucide-react";
import { titleOf, captionOf, labelOf } from "../data/galleryItems";

const SWIPE_DISTANCE = 50;

/**
 * Lightbox with zoom, previous/next navigation, keyboard control and touch swipe.
 *
 * Every piece of text is read from the item passed in, so navigating keeps the
 * image, year, event name and caption of that same photo together.
 */
export default function Lightbox({ items, index, onClose, onNavigate }) {
  const [zoom, setZoom] = useState(1);
  const [broken, setBroken] = useState(false);
  const touchStart = useRef(null);
  const item = items?.[index];
  const total = items?.length || 0;

  const prev = useCallback(() => total && onNavigate((index - 1 + total) % total), [index, total, onNavigate]);
  const next = useCallback(() => total && onNavigate((index + 1) % total), [index, total, onNavigate]);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  useEffect(() => { setZoom(1); setBroken(false); }, [index]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd = (e) => {
    if (touchStart.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStart.current;
    touchStart.current = null;
    if (Math.abs(delta) < SWIPE_DISTANCE) return;
    if (delta > 0) prev();
    else next();
  };

  const heading = titleOf(item);
  const caption = captionOf(item);
  const label = labelOf(item);

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[90] flex flex-col bg-ink/90 backdrop-blur-lg"
          role="dialog"
          aria-modal="true"
          aria-label={heading}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          <div className="flex items-center justify-between gap-3 p-4 text-white">
            <span className="min-w-0 truncate text-sm text-white/70">{label || "Media"}</span>
            <div className="flex shrink-0 items-center gap-2">
              {item.type !== "video" && (
                <>
                  <button onClick={() => setZoom((z) => Math.min(z + 0.5, 3))} className="rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/25" aria-label="Zoom in"><ZoomIn size={20} /></button>
                  <button onClick={() => setZoom((z) => Math.max(z - 0.5, 1))} className="rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/25" aria-label="Zoom out"><ZoomOut size={20} /></button>
                </>
              )}
              <button onClick={onClose} className="rounded-full bg-white/10 p-2 backdrop-blur transition hover:bg-white/25" aria-label="Close"><X size={22} /></button>
            </div>
          </div>

          <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 pb-28 sm:px-20">
            <button onClick={prev} disabled={total < 2} className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:scale-110 hover:bg-white/25 disabled:opacity-30 sm:left-6" aria-label="Previous image"><ChevronLeft size={22} /></button>
            {item.type === "video" ? (
              <video src={item.image} controls autoPlay className="max-h-full max-w-full rounded-xl shadow-2xl" />
            ) : broken ? (
              <div className="flex max-h-full max-w-full flex-col items-center justify-center gap-3 rounded-xl bg-white/10 p-10 text-center text-white/60">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <circle cx="9" cy="9" r="2" />
                  <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                </svg>
                <span className="text-sm font-medium">Image unavailable</span>
              </div>
            ) : (
              <motion.img
                key={item.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                src={item.image}
                alt={item.alt || heading}
                onError={() => setBroken(true)}
                className="max-h-full max-w-full rounded-xl object-contain shadow-2xl"
                style={{ transform: `scale(${zoom})` }}
              />
            )}
            <button onClick={next} disabled={total < 2} className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur transition hover:scale-110 hover:bg-white/25 disabled:opacity-30 sm:right-6" aria-label="Next image"><ChevronRight size={22} /></button>

            <div className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-3 px-6">
              <span className="flex items-center gap-2 whitespace-nowrap rounded-full bg-white/10 px-4 py-1.5 text-sm text-white/80 backdrop-blur">
                <span>{index + 1} / {total}</span>
                {item.year && <span className="text-white/40">·</span>}
                {item.year && <span>{item.year}</span>}
              </span>
              {(heading || caption) && (
                <div className="max-h-[38vh] max-w-2xl overflow-y-auto rounded-2xl bg-ink/70 px-6 py-4 text-center backdrop-blur-md">
                  {heading && (
                    <p className="break-words font-heading text-lg font-semibold leading-snug text-white">{heading}</p>
                  )}
                  {caption && (
                    <p className="mt-1.5 break-words text-sm leading-relaxed text-white/75">{caption}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function PlayBadge() {
  return (
    <span className="absolute inset-0 flex items-center justify-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-white/90 text-primary shadow-lift transition-transform duration-300 group-hover:scale-110">
        <Play size={22} className="ml-0.5 fill-primary" />
      </span>
    </span>
  );
}
