import ReturnsWidget from "@/components/adminPanel/dashboard/ReturnsWidget";
import { getReturnsStatusCounts } from "@/server-actions/stats/dashboard";

export default async function ReturnsSection() {
  const returns = await getReturnsStatusCounts();
  return (
    <ReturnsWidget
      className="h-full md:col-span-2 xl:col-span-2"
      buckets={returns.buckets}
      error={returns.error}
    />
  );
}
