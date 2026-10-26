import OrdersStatusWidget from "@/components/adminPanel/dashboard/OrdersStatusWidget";
import ProductStagesWidget from "@/components/adminPanel/dashboard/ProductStagesWidget";
import QuickLinksWidget from "@/components/adminPanel/dashboard/QuickLinksWidget";
import ReturnsWidget from "@/components/adminPanel/dashboard/ReturnsWidget";
import SalesStatsWidget from "@/components/adminPanel/dashboard/SalesStatsWidget";
import SalesValueChartWidget from "@/components/adminPanel/dashboard/SalesValueChartWidget";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import {
  getOrderStatusCounts,
  getProductStageCounts,
  getReturnsStatusCounts,
  getSalesDaily,
} from "@/server-actions/stats/dashboard";

export default async function AdminDashboardPage() {
  const [sales, orders, stages, returns] = await Promise.all([
    getSalesDaily(30),
    getOrderStatusCounts(),
    getProductStageCounts(),
    getReturnsStatusCounts(),
  ]);

  return (
    <>
      <SubpageHeading text="Dashboard" />
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:items-stretch">
          <div className="flex flex-col gap-4">
            <OrdersStatusWidget counts={orders.counts} error={orders.error} />
            <SalesStatsWidget today={sales.today} points={sales.points} />
          </div>
          <SalesValueChartWidget
            className="xl:h-full"
            today={sales.today}
            points={sales.points}
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          <ReturnsWidget
            className="h-full md:col-span-2 xl:col-span-2"
            buckets={returns.buckets}
            error={returns.error}
          />
          <ProductStagesWidget className="h-full" stages={stages} />
          <QuickLinksWidget className="h-full" />
        </div>
      </div>
    </>
  );
}
