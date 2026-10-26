import OrdersStatusWidget from "@/components/adminPanel/dashboard/OrdersStatusWidget";
import ProductStagesWidget from "@/components/adminPanel/dashboard/ProductStagesWidget";
import QuickLinksWidget from "@/components/adminPanel/dashboard/QuickLinksWidget";
import ReturnsWidget from "@/components/adminPanel/dashboard/ReturnsWidget";
import SalesStatsWidget from "@/components/adminPanel/dashboard/SalesStatsWidget";
import SalesValueChartWidget from "@/components/adminPanel/dashboard/SalesValueChartWidget";
import {
  emptyReturnBuckets,
  OrderStatusCount,
  PRODUCT_STAGE_WIDGETS,
  SalesDailyPoint,
} from "@/lib/stats/sales";

const counts: OrderStatusCount[] = [
  { status: "NEW", label: "Nowe", dtc: 45, allegro: 8 },
  { status: "PROCESSING", label: "W realizacji", dtc: 8, allegro: 7 },
  { status: "READY_FOR_SHIPMENT", label: "Do wysyłki", dtc: 2, allegro: 1 },
  { status: "SENT", label: "Wysłane", dtc: 0, allegro: 0 },
  { status: "CANCELLED", label: "Anulowane", dtc: 0, allegro: 0 },
];

const today = "2026-10-26";
const channel = {
  revenue: 120000,
  cogs: 50000,
  orders: 4,
  cogsEstimatedOrders: 0,
};
const points: SalesDailyPoint[] = [
  {
    date: "2026-10-25",
    DTC: channel,
    AL1: channel,
    AL2: { ...channel, revenue: 40000 },
  },
];

export default function DashboardLayoutPreviewPage() {
  return (
    <main className="mx-auto my-8 w-[90%] max-w-[1440px]">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 items-start gap-4 xl:grid-cols-2 xl:items-stretch">
          <div className="flex flex-col gap-4">
            <OrdersStatusWidget counts={counts} error={null} />
            <SalesStatsWidget today={today} points={points} />
          </div>
          <SalesValueChartWidget
            className="xl:h-full"
            today={today}
            points={points}
          />
        </div>
        <div className="grid grid-cols-1 items-start gap-4 md:grid-cols-2 xl:grid-cols-4 xl:items-stretch">
          <ReturnsWidget
            className="h-full md:col-span-2 xl:col-span-2"
            buckets={emptyReturnBuckets()}
            error={null}
          />
          <ProductStagesWidget
            className="h-full"
            stages={PRODUCT_STAGE_WIDGETS.map((stage) => ({
              ...stage,
              count: 2,
            }))}
          />
          <QuickLinksWidget className="h-full" />
        </div>
      </div>
    </main>
  );
}
