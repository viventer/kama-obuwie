import { Skeleton } from "@/components/ui/skeleton";

const PRODUCT_GRID_CLASS =
  "grid gap-x-2 gap-y-8 md:gap-8 grid-cols-[repeat(auto-fill,_minmax(9rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))]";

export default function ListingPageSkeleton({
  productCount = 8,
}: {
  productCount?: number;
}) {
  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 mt-4 min-h-[60vh]">
      <Skeleton className="h-8 w-48 mb-4 rounded-xs" />

      <section className="hidden md:flex mb-6 gap-2 items-center flex-wrap">
        <Skeleton className="h-10 w-24 rounded-xs" />
        <Skeleton className="h-10 w-28 rounded-xs" />
        <Skeleton className="h-10 w-20 rounded-xs" />
        <Skeleton className="h-10 w-36 rounded-xs" />
      </section>

      <section className={PRODUCT_GRID_CLASS}>
        {Array.from({ length: productCount }).map((_, index) => (
          <div key={index} className="flex flex-col">
            <Skeleton className="aspect-square w-full rounded-xs" />
            <div className="py-2 px-2 xs:px-3 flex flex-col gap-2">
              <Skeleton className="h-6 w-2/3 rounded-xs" />
              <Skeleton className="h-6 w-1/3 rounded-xs" />
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
