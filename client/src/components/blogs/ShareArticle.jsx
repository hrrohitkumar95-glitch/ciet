import { useEffect, useState } from "react";
import { Facebook, Twitter, Linkedin, Link2, Check, Share2 } from "lucide-react";

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.appendChild(field);
  field.select();
  document.execCommand("copy");
  document.body.removeChild(field);
}

/** Social share buttons plus a working Copy Link control. */
export default function ShareArticle({ url, title = "" }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return undefined;
    const timer = setTimeout(() => setCopied(false), 2200);
    return () => clearTimeout(timer);
  }, [copied]);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const targets = [
    { label: "Facebook", Icon: Facebook, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { label: "X", Icon: Twitter, href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { label: "LinkedIn", Icon: Linkedin, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  const handleCopy = async () => {
    try {
      await copyText(url);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-[24px] bg-primary/5 p-6">
      <p className="flex items-center gap-2.5 font-heading text-lg font-semibold text-ink">
        <Share2 size={19} className="text-primary" aria-hidden="true" />
        Share this article
      </p>

      <div className="flex flex-wrap items-center gap-2.5">
        {targets.map(({ label, Icon, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Share on ${label}`}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-muted shadow-card transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
          >
            <Icon size={18} aria-hidden="true" />
          </a>
        ))}

        <button
          type="button"
          onClick={handleCopy}
          className="flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-semibold text-muted shadow-card transition-colors hover:bg-primary hover:text-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/25"
        >
          {copied ? <Check size={17} aria-hidden="true" /> : <Link2 size={16} aria-hidden="true" />}
          {copied ? "Link copied!" : "Copy Link"}
        </button>
      </div>

      <p className="sr-only" role="status" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </p>
    </section>
  );
}
