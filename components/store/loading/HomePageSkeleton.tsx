import { Skeleton } from "@/components/ui/skeleton";

export default function HomePageSkeleton() {
  return (
    <div className="flex flex-col gap-16 mt-4 min-h-[60vh]">
      <section className="flex flex-col gap-8 border-b-1 pb-16">
        <Skeleton className="w-full aspect-[3/2] md:aspect-[21/9] rounded-xs" />
        <div className="flex gap-8 flex-col lg:flex-row">
          <Skeleton className="flex-[2] h-36 rounded-xs" />
          <Skeleton className="flex-1 h-36 rounded-xs" />
        </div>
      </section>

      <section className="flex flex-col gap-6">
        <Skeleton className="h-10 w-64 rounded-xs" />
        <div className="flex gap-4 overflow-hidden">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-24 w-32 shrink-0 rounded-xs" />
          ))}
        </div>
        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(9rem,1fr))] md:grid-cols-[repeat(auto-fill,minmax(16rem,1fr))]">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="aspect-square rounded-xs" />
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <Skeleton className="h-8 w-72 rounded-xs" />
        <Skeleton className="h-48 w-full rounded-xs" />
      </section>
    </div>
  );
}
