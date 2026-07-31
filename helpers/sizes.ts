import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";

type SizeRange = { from: number; to: number };

/** Max EU size span for listing filters per root category. */
export const ROOT_CATEGORY_SIZE_RANGES: Partial<
  Record<RootCategory, SizeRange>
> = {
  "obuwie damskie": { from: 35, to: 43 },
  "obuwie męskie": { from: 36, to: 47 },
  "obuwie dziecięce": { from: 19, to: 41 },
};

/**
 * Minimum span always shown (even without stock).
 * Women's: entire catalog range. Men's/kids: core commercial sizes.
 */
export const ROOT_CATEGORY_GUARANTEED_SIZE_RANGES: Partial<
  Record<RootCategory, SizeRange>
> = {
  "obuwie damskie": { from: 35, to: 43 },
  "obuwie męskie": { from: 40, to: 46 },
  "obuwie dziecięce": { from: 25, to: 36 },
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

/**
 * Visible filter sizes: trim leading/trailing out-of-stock sizes,
 * keep gaps in the middle, and never shrink below the guaranteed span.
 */
export const getVisibleListingSizeRange = (
  rootCategory: RootCategory | undefined,
  availableSizes: Iterable<string>,
): string[] | null => {
  if (!rootCategory) return null;

  const fullRange = ROOT_CATEGORY_SIZE_RANGES[rootCategory];
  const guaranteed = ROOT_CATEGORY_GUARANTEED_SIZE_RANGES[rootCategory];
  if (!fullRange || !guaranteed) return null;

  const availableInRange = Array.from(availableSizes)
    .map(Number)
    .filter(
      (size) =>
        Number.isFinite(size) &&
        size >= fullRange.from &&
        size <= fullRange.to,
    );

  let displayFrom = guaranteed.from;
  let displayTo = guaranteed.to;

  if (availableInRange.length > 0) {
    displayFrom = Math.min(displayFrom, ...availableInRange);
    displayTo = Math.max(displayTo, ...availableInRange);
  }

  displayFrom = Math.max(displayFrom, fullRange.from);
  displayTo = Math.min(displayTo, fullRange.to);

  return generateNumericSizeRange(displayFrom, displayTo);
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
