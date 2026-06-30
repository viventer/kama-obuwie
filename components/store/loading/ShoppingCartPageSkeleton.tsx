import { Skeleton } from "@/components/ui/skeleton";

function ShoppingCartItemSkeleton() {
  return (
    <div className="rounded-xs border border-border p-2 sm:p-4">
      <div className="flex items-center gap-4 px-2">
        <Skeleton className="aspect-square w-20 shrink-0 rounded-xs sm:w-24" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-xs" />
          <Skeleton className="h-5 w-24 rounded-xs" />
          <Skeleton className="h-4 w-1/2 rounded-xs" />
        </div>
        <div className="flex flex-col gap-4 xs:flex-row">
          <Skeleton className="size-10 rounded-xs" />
          <Skeleton className="size-10 rounded-xs" />
        </div>
      </div>
    </div>
  );
}

export default function ShoppingCartPageSkeleton({
  itemCount = 2,
}: {
  itemCount?: number;
}) {
  return (
    <div className="mx-auto my-4 min-h-[60vh] max-w-4xl">
      <Skeleton className="mb-4 h-8 w-32 rounded-xs" />

      <div className="space-y-4">
        {Array.from({ length: itemCount }).map((_, index) => (
          <ShoppingCartItemSkeleton key={index} />
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-x-4 gap-y-8 border-t border-border pt-4 md:flex-row md:justify-between">
        <div className="flex-1 space-y-4">
          <Skeleton className="h-8 w-48 rounded-xs" />
          <Skeleton className="h-5 w-full max-w-md rounded-xs" />
          <Skeleton className="h-12 w-32 rounded-xs" />
          <Skeleton className="h-5 w-56 rounded-xs" />
        </div>
        <div className="flex flex-col gap-4 md:w-72">
          <Skeleton className="h-36 w-full rounded-xs" />
          <Skeleton className="h-28 w-full rounded-xs" />
        </div>
      </div>
    </div>
  );
}
