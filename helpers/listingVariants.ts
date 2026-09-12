import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export function groupVariantsByProductId(
  products: ProductListingData[],
): Map<string, ProductListingData[]> {
  const variantsByProductId = new Map<string, ProductListingData[]>();

  for (const product of products) {
    const existing = variantsByProductId.get(product.id);
    if (existing) {
      existing.push(product);
    } else {
      variantsByProductId.set(product.id, [product]);
    }
  }

  return variantsByProductId;
}
