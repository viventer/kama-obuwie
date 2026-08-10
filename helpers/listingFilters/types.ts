import { PriceRange } from "@/helpers/prices";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

export type ListingSort = "default" | "priceAsc" | "priceDesc";

export type ListingCategoryFacet = {
  id: string;
  label: string;
  count: number;
};

export type ListingFiltersState = {
  sort: ListingSort;
  sizes: string[];
  priceRanges: PriceRange[];
  colors: string[];
  externalMaterials: string[];
  fastenings: string[];
  /** Stage 1: gender / root category filter (search listing only). */
  rootCategory?: RootCategory;
  /** Stage 2: concrete category id (single-select, search listing only). */
  categoryId?: string;
};

export type ListingSizeFacet = {
  value: string;
  available: boolean;
};

export type ListingFacets = {
  sizes: ListingSizeFacet[];
  priceRanges: PriceRange[];
  colors: string[];
  externalMaterials: string[];
  fastenings: string[];
  categories: ListingCategoryFacet[];
};

export const DEFAULT_LISTING_FILTERS_STATE: ListingFiltersState = {
  sort: "default",
  sizes: [],
  priceRanges: [],
  colors: [],
  externalMaterials: [],
  fastenings: [],
  rootCategory: undefined,
  categoryId: undefined,
};

export const SORT_OPTIONS: { value: ListingSort; label: string }[] = [
  { value: "default", label: "Domyślne" },
  { value: "priceAsc", label: "Najniższa cena" },
  { value: "priceDesc", label: "Najwyższa cena" },
];

export const ROOT_CATEGORY_URL_VALUES: Record<
  "obuwie męskie" | "obuwie damskie" | "obuwie dziecięce",
  string
> = {
  "obuwie męskie": "meskie",
  "obuwie damskie": "damskie",
  "obuwie dziecięce": "dzieciece",
};

export const ROOT_CATEGORY_FROM_URL: Record<string, RootCategory> = {
  meskie: "obuwie męskie",
  damskie: "obuwie damskie",
  dzieciece: "obuwie dziecięce",
};

export const ROOT_CATEGORY_LABELS: Record<
  "obuwie męskie" | "obuwie damskie" | "obuwie dziecięce",
  string
> = {
  "obuwie męskie": "Męskie",
  "obuwie damskie": "Damskie",
  "obuwie dziecięce": "Dziecięce",
};
