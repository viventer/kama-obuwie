import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { getPriceRangesForFiltering } from "@/helpers/prices";
import {
  getListingSizeRangeForRootCategory,
  isRangeSize,
  parseRangeSize,
} from "@/helpers/sizes";
import { ListingFacets, ListingSizeFacet } from "./types";

/** Collect sizes that have at least one product with availability > 0. */
export const getAvailableListingSizes = (
  products: ProductListingData[],
): string[] => {
  const sizesSet = new Set<string>();

  products.forEach((product) => {
    Object.entries(product.availability).forEach(([size, qty]) => {
      if (qty <= 0) return;
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

const buildListingSizeFacets = (
  products: ProductListingData[],
  rootCategory: RootCategory | undefined,
): ListingSizeFacet[] => {
  const availableSizes = new Set(getAvailableListingSizes(products));
  const fixedRange = getListingSizeRangeForRootCategory(rootCategory);

  if (fixedRange) {
    return fixedRange.map((value) => ({
      value,
      available: availableSizes.has(value),
    }));
  }

  // Accessories / unknown root: only sizes that currently have stock.
  return Array.from(availableSizes)
    .sort((a, b) => Number(a) - Number(b))
    .map((value) => ({ value, available: true }));
};

const uniqueSorted = (values: string[]): string[] =>
  Array.from(new Set(values)).sort((a, b) =>
    a.localeCompare(b, "pl", { sensitivity: "base" }),
  );

export const getListingFacets = (
  products: ProductListingData[],
  rootCategory?: RootCategory,
): ListingFacets => {
  const colors: string[] = [];
  const externalMaterials: string[] = [];
  const fastenings: string[] = [];

  const pricesSet = new Set<number>();

  products.forEach((product) => {
    if (product.price !== undefined && product.price !== null) {
      pricesSet.add(Number(product.price));
    }
    if (product.filters?.color) {
      colors.push(product.filters.color);
    }
    if (product.filters?.externalMaterial) {
      externalMaterials.push(...product.filters.externalMaterial);
    }
    if (product.filters?.fastening) {
      fastenings.push(...product.filters.fastening);
    }
  });

  return {
    sizes: buildListingSizeFacets(products, rootCategory),
    priceRanges: getPriceRangesForFiltering(Array.from(pricesSet)) ?? [],
    colors: uniqueSorted(colors),
    externalMaterials: uniqueSorted(externalMaterials),
    fastenings: uniqueSorted(fastenings),
  };
};
