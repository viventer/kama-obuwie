import { Skeleton } from "@/components/ui/skeleton";

export default function ProductPageSkeleton() {
  return (
    <div className="min-h-[60vh]">
      <Skeleton className="mb-2 h-10 w-40 rounded-xs md:mb-3" />

      <div className="flex flex-col gap-4 sm:gap-8 md:flex-row">
        <div className="flex flex-col gap-8 md:flex-none">
          <Skeleton className="aspect-square w-full max-w-md rounded-xs md:w-[28rem]" />
          <div className="hidden flex-col gap-3 md:flex">
            <Skeleton className="h-5 w-full rounded-xs" />
            <Skeleton className="h-5 w-5/6 rounded-xs" />
            <Skeleton className="h-5 w-4/6 rounded-xs" />
          </div>
        </div>

        <div className="flex w-full flex-1 flex-col gap-4">
          <Skeleton className="h-12 w-full max-w-lg rounded-xs md:h-16" />
          <Skeleton className="h-14 w-40 rounded-xs" />

          <div className="flex flex-col gap-4">
            <Skeleton className="h-6 w-24 rounded-xs" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <Skeleton key={index} className="size-16 rounded-xs" />
              ))}
            </div>

            <Skeleton className="h-6 w-20 rounded-xs" />
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={index} className="h-10 w-12 rounded-xs" />
              ))}
            </div>

            <Skeleton className="h-14 w-full max-w-[300px] rounded-xs" />
            <Skeleton className="h-5 w-64 rounded-xs" />
            <Skeleton className="h-28 w-full max-w-md rounded-xs" />
            <Skeleton className="h-36 w-full rounded-xs md:hidden" />
          </div>
        </div>
      </div>
    </div>
  );
}
