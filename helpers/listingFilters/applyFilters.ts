import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import { isProductPriceInRange } from "@/helpers/prices";
import { hasSelectedSizes } from "@/helpers/sizes";
import { ListingFiltersState } from "./types";

const productMatchesColors = (
  product: ProductListingData,
  selected: string[],
): boolean => {
  if (selected.length === 0) return true;
  const color = product.filters?.color;
  return !!color && selected.includes(color);
};

const productMatchesStringArray = (
  productValues: string[] | undefined,
  selected: string[],
): boolean => {
  if (selected.length === 0) return true;
  if (!productValues || productValues.length === 0) return false;
  return selected.some((s) => productValues.includes(s));
};

export const applyListingFilters = (
  products: ProductListingData[],
  state: ListingFiltersState,
): ProductListingData[] => {
  let filtered = products;

  if (state.sizes.length > 0) {
    filtered = filtered.filter((product) =>
      hasSelectedSizes(state.sizes, product.availability),
    );
  }

  if (state.priceRanges.length > 0) {
    filtered = filtered.filter((product) =>
      isProductPriceInRange(product, state.priceRanges),
    );
  }

  if (state.colors.length > 0) {
    filtered = filtered.filter((product) =>
      productMatchesColors(product, state.colors),
    );
  }

  if (state.externalMaterials.length > 0) {
    filtered = filtered.filter((product) =>
      productMatchesStringArray(
        product.filters?.externalMaterial,
        state.externalMaterials,
      ),
    );
  }

  if (state.fastenings.length > 0) {
    filtered = filtered.filter((product) =>
      productMatchesStringArray(product.filters?.fastening, state.fastenings),
    );
  }

  if (state.sort === "default") {
    return filtered;
  }

  // Stable sort: decorate with original index
  const decorated = filtered.map((product, index) => ({ product, index }));
  decorated.sort((a, b) => {
    const priceA = Number(a.product.price);
    const priceB = Number(b.product.price);
    const cmp =
      state.sort === "priceAsc" ? priceA - priceB : priceB - priceA;
    if (cmp !== 0) return cmp;
    return a.index - b.index;
  });
  return decorated.map((d) => d.product);
};

export const countActiveFilters = (state: ListingFiltersState): number => {
  return (
    state.sizes.length +
    state.priceRanges.length +
    state.colors.length +
    state.externalMaterials.length +
    state.fastenings.length
  );
};

export const hasActiveFilters = (state: ListingFiltersState): boolean =>
  countActiveFilters(state) > 0 || state.sort !== "default";
