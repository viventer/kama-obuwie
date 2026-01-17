import { cn } from "@/lib/utils";
import ProductAdvantages from "./ProductAdvantages";
import { StoreProductDataForStore } from "@/server-actions/store/getStoreProductPageData";
import ProductSpecifications from "./ProductSpecifications";
import ProductSalesDescription from "./ProductSalesDescription";
import { parseProductDescription } from "@/helpers/productInfo";

export default function ProductInfo({
  className,
  productData,
}: {
  className?: string;
  productData: StoreProductDataForStore;
}) {
  const { advantages, salesDescription } = parseProductDescription(
    productData.description
  );

  console.log(advantages);
  console.log(salesDescription);

  return (
    <section className={cn("", className)}>
      <h2 className="text-lg md:text-xl font-semibold mb-4">
        Informacje o produkcie
      </h2>
      <ProductAdvantages advantages={advantages} />
      <ProductSalesDescription salesDescription={salesDescription} />
      <ProductSpecifications productParameters={productData.parameters} />
    </section>
  );
}
