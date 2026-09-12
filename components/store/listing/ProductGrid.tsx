import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";

export default function ProductGrid({
  products,
  priorityCount = 0,
  variantsByProductId,
}: {
  products: ProductListingData[];
  priorityCount?: number;
  variantsByProductId?: Map<string, ProductListingData[]>;
}) {
  return (
    <section className="grid gap-x-2 gap-y-8 md:gap-8 grid-cols-[repeat(auto-fill,_minmax(9rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))]">
      {products.map((product, index) => (
        <ProductFromList
          key={`${product.id}-${product.colorVariantName}`}
          product={product}
          priority={index < priorityCount}
          variants={variantsByProductId?.get(product.id)}
        />
      ))}
    </section>
  );
}
