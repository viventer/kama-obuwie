import SalesValueChartWidget from "@/components/adminPanel/dashboard/SalesValueChartWidget";
import { getSalesDaily } from "@/server-actions/stats/dashboard";

export default async function SalesValueChartSection() {
  const sales = await getSalesDaily(30);
  return (
    <SalesValueChartWidget
      className="xl:h-full"
      today={sales.today}
      points={sales.points}
    />
  );
}
