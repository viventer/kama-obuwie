import ProductStagesWidget from "@/components/adminPanel/dashboard/ProductStagesWidget";
import { getProductStageCounts } from "@/server-actions/stats/dashboard";

export default async function ProductStagesSection() {
  const stages = await getProductStageCounts();
  return <ProductStagesWidget className="h-full" stages={stages} />;
}
