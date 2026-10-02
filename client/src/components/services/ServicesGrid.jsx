import ServiceCard from "./ServiceCard";

function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-line bg-white" aria-hidden="true">
      <div className="aspect-[16/10] w-full animate-pulse bg-sage motion-reduce:animate-none" />
      <div className="space-y-3 p-6 sm:p-7">
        <div className="h-3 w-20 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-5 w-3/4 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-3.5 w-full animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="h-3.5 w-5/6 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        <div className="flex items-center justify-between pt-3">
          <div className="h-3 w-20 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
          <div className="h-3.5 w-24 animate-pulse rounded-full bg-line motion-reduce:animate-none" />
        </div>
      </div>
    </div>
  );
}

/** Responsive services grid: 1 column mobile, 2 tablet, 3 desktop. */
export default function ServicesGrid({ services = [], loading = false, skeletonCount = 6 }) {
  if (loading) {
    return (
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: skeletonCount }, (_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceCard key={service._id || service.slug} service={service} />
      ))}
    </div>
  );
}
