import SalesStatsWidget from "@/components/adminPanel/dashboard/SalesStatsWidget";
import { getSalesDaily } from "@/server-actions/stats/dashboard";

export default async function SalesStatsSection() {
  const sales = await getSalesDaily(30);
  return <SalesStatsWidget today={sales.today} points={sales.points} />;
}
