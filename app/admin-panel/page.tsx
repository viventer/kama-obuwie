import { Suspense } from "react";
import OrdersStatusSection from "@/components/adminPanel/dashboard/OrdersStatusSection";
import ProductStagesSection from "@/components/adminPanel/dashboard/ProductStagesSection";
import QuickLinksWidget from "@/components/adminPanel/dashboard/QuickLinksWidget";
import ReturnsSection from "@/components/adminPanel/dashboard/ReturnsSection";
import SalesStatsSection from "@/components/adminPanel/dashboard/SalesStatsSection";
import SalesValueChartSection from "@/components/adminPanel/dashboard/SalesValueChartSection";
import {
  OrdersStatusSkeleton,
  ProductStagesSkeleton,
  ReturnsSkeleton,
  SalesStatsSkeleton,
  SalesValueChartSkeleton,
} from "@/components/adminPanel/dashboard/DashboardSkeletons";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";

export default function AdminDashboardPage() {
  return (
    <>
      <SubpageHeading text="Dashboard" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:items-stretch">
          <div className="flex flex-col gap-4">
            <Suspense fallback={<OrdersStatusSkeleton />}>
              <OrdersStatusSection />
            </Suspense>
            <Suspense fallback={<SalesStatsSkeleton />}>
              <SalesStatsSection />
            </Suspense>
          </div>
          <Suspense fallback={<SalesValueChartSkeleton />}>
            <SalesValueChartSection />
          </Suspense>
        </div>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          <Suspense fallback={<ReturnsSkeleton />}>
            <ReturnsSection />
          </Suspense>
          <Suspense fallback={<ProductStagesSkeleton />}>
            <ProductStagesSection />
          </Suspense>
          <QuickLinksWidget className="h-full" />
        </div>
      </div>
    </>
  );
}
