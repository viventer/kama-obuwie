import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import { Skeleton } from "@/components/ui/skeleton";

export function OrdersStatusSkeleton() {
  return (
    <DashboardCard title="Zamówienia">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton
            key={index}
            className="mx-auto h-[88px] w-full max-w-[140px] bg-muted"
          />
        ))}
      </div>
    </DashboardCard>
  );
}

export function SalesStatsSkeleton() {
  return (
    <DashboardCard
      title="Statystyki sprzedaży"
      action={<Skeleton className="h-8 w-56 bg-muted" />}
    >
      <div className="flex flex-col gap-3">
        <Skeleton className="h-8 w-full bg-muted" />
        <Skeleton className="h-8 w-full bg-muted" />
        <Skeleton className="h-8 w-full bg-muted" />
        <Skeleton className="h-8 w-full bg-muted" />
      </div>
    </DashboardCard>
  );
}

export function SalesValueChartSkeleton() {
  return (
    <DashboardCard
      title="Wartość sprzedaży"
      className="xl:h-full xl:min-h-0"
      contentClassName="xl:flex xl:min-h-0 xl:flex-1 xl:flex-col"
      action={<Skeleton className="h-8 w-44 bg-muted" />}
    >
      <Skeleton className="h-[280px] w-full bg-muted xl:min-h-[280px] xl:flex-1" />
    </DashboardCard>
  );
}

export function ReturnsSkeleton() {
  return (
    <DashboardCard title="Zwroty" className="h-full md:col-span-2 xl:col-span-2">
      <Skeleton className="h-[220px] w-full bg-muted" />
    </DashboardCard>
  );
}

export function ProductStagesSkeleton() {
  return (
    <DashboardCard title="Produkty" className="h-full">
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <Skeleton key={index} className="mx-auto size-[92px] rounded-full bg-muted" />
        ))}
      </div>
    </DashboardCard>
  );
}
