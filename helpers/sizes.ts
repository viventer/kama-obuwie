import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";

/** Fixed EU size ranges shown in listing filters, regardless of stock. */
export const ROOT_CATEGORY_SIZE_RANGES: Partial<
  Record<RootCategory, { from: number; to: number }>
> = {
  "obuwie damskie": { from: 35, to: 43 },
  "obuwie męskie": { from: 36, to: 47 },
  "obuwie dziecięce": { from: 19, to: 41 },
};

export const generateNumericSizeRange = (
  from: number,
  to: number,
): string[] => {
  const sizes: string[] = [];
  for (let size = from; size <= to; size++) {
    sizes.push(String(size));
  }
  return sizes;
};

export const getListingSizeRangeForRootCategory = (
  rootCategory: RootCategory | undefined,
): string[] | null => {
  if (!rootCategory) return null;
  const range = ROOT_CATEGORY_SIZE_RANGES[rootCategory];
  if (!range) return null;
  return generateNumericSizeRange(range.from, range.to);
};

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
