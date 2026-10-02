import GalleryTile from "./GalleryTile";

function SkeletonTile() {
  return (
    <div data-gallery-skeleton className="overflow-hidden rounded-[20px] border border-line bg-white" aria-hidden="true">
      <div className="aspect-[4/3] w-full animate-pulse bg-sage motion-reduce:animate-none" />
      <div className="space-y-2.5 p-4 sm:p-5">
        <div className="h-3 w-14 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-4 w-4/5 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-3 w-3/5 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
      </div>
    </div>
  );
}

/**
 * Uniform responsive grid: 1 column on phones, 2 on tablets, 3 on laptops and 4
 * on wide screens. Every tile is the same aspect ratio, so the grid can never
 * grow ragged or leave gaps.
 */
export default function GalleryGrid({ items = [], loading = false, skeletonCount = 8, onOpen }) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonTile key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6 xl:grid-cols-4">
      {items.map((item, index) => (
        <GalleryTile key={item.id} item={item} index={item.flatIndex ?? index} onOpen={onOpen} />
      ))}
    </div>
  );
}
