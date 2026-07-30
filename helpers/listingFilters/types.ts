import { PriceRange } from "@/helpers/prices";

export type ListingSort = "default" | "priceAsc" | "priceDesc";

export type ListingFiltersState = {
  sort: ListingSort;
  sizes: string[];
  priceRanges: PriceRange[];
  colors: string[];
  externalMaterials: string[];
  fastenings: string[];
};

export type ListingFacets = {
  sizes: string[];
  priceRanges: PriceRange[];
  colors: string[];
  externalMaterials: string[];
  fastenings: string[];
};

export const DEFAULT_LISTING_FILTERS_STATE: ListingFiltersState = {
  sort: "default",
  sizes: [],
  priceRanges: [],
  colors: [],
  externalMaterials: [],
  fastenings: [],
};

export const SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: "default", label: "Domyślne" },
  { value: "priceAsc", label: "Najniższa cena" },
  { value: "priceDesc", label: "Najwyższa cena" },
];
