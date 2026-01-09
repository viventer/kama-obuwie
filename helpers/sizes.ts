import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export const isRangeSize = (size: string) => {
  return size.includes("-");
};

export const parseRangeSize = (size: string) => {
  const [from, to] = size.split("-").map((s) => s.trim());
  return { from, to };
};

export const hasSelectedSizes = (
  selectedSizes: string[],
  productAvailability: ProductListingData["availability"]
): boolean => {
  const productSizes = Object.keys(productAvailability);
  const availableProductSizes: string[] = productSizes.filter(
    (size) => productAvailability[size] > 0
  );

  const formattedSizes = availableProductSizes.filter(
    (size) => !isRangeSize(size)
  );
  const rangeSizes = availableProductSizes.filter((size) => isRangeSize(size));

  if (rangeSizes.length > 0) {
    rangeSizes.forEach((rangeSize) => {
      const { from, to } = parseRangeSize(rangeSize);
      formattedSizes.push(from);
      formattedSizes.push(to);
    });
  }

  return selectedSizes.some((size) => formattedSizes.includes(size));
};

export const getAllListingSizes = (
  products: ProductListingData[]
): string[] => {
  const sizesSet = new Set<string>();

  products.forEach((product) => {
    Object.keys(product.availability).forEach((size) => {
      if (isRangeSize(size)) {
        const { from, to } = parseRangeSize(size);
        sizesSet.add(from);
        sizesSet.add(to);
        return;
      }
      sizesSet.add(size);
    });
  });

  return Array.from(sizesSet).sort((a, b) => Number(a) - Number(b));
};
