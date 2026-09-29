/** Horizontally scrollable category filter pills. */
export default function BlogCategories({ categories = [], active = "All", onChange }) {
  const options = ["All", ...categories.filter((c) => c && c !== "All")];

  return (
    <div
      role="group"
      aria-label="Filter articles by category"
      className="-mx-1 flex gap-2.5 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {options.map((category) => {
        const isActive = active === category;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            aria-pressed={isActive}
            className={`shrink-0 whitespace-nowrap rounded-full border px-5 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/20 ${
              isActive
                ? "border-primary bg-primary text-white"
                : "border-line bg-white text-ink/75 hover:border-primary/40 hover:text-primary"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
