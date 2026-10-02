import { RefreshCcw, WifiOff } from "lucide-react";

/** Small non-blocking notice shown while rendering the bundled gallery. */
export default function GalleryNotice({ onRetry, busy = false }) {
  return (
    <div
      role="status"
      data-gallery-notice
      className="mb-7 flex flex-col gap-3 rounded-[18px] border border-honey/40 bg-honey/10 px-5 py-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <p className="flex items-start gap-2.5 text-sm leading-relaxed text-ink/80">
        <WifiOff size={17} className="mt-0.5 shrink-0 text-honey" aria-hidden="true" />
        <span>Showing our saved gallery while we reconnect. Every photo below is from the GOLZ archive.</span>
      </p>

      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          disabled={busy}
          className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-line bg-white px-4 py-2 text-xs font-semibold text-primary transition-colors hover:border-primary/40 disabled:opacity-60 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/25 sm:self-auto"
        >
          <RefreshCcw size={14} aria-hidden="true" />
          {busy ? "Retrying" : "Retry live gallery"}
        </button>
      ) : null}
    </div>
  );
}
