"use client";

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
    productData.description,
  );

  return (
    <section className={cn("flex flex-col gap-4", className)}>
      {advantages.length > 0 && <ProductAdvantages advantages={advantages} />}
      {salesDescription && (
        <ProductSalesDescription salesDescription={salesDescription} />
      )}
      <ProductSpecifications productParameters={productData.parameters} />
    </section>
  );
}
