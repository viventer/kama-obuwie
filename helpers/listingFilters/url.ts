import { PriceRange, parsePriceRangeKey, priceRangeToKey } from "@/helpers/prices";
import {
  ListingFiltersState,
  ListingSort,
  ROOT_CATEGORY_FROM_URL,
  ROOT_CATEGORY_URL_VALUES,
} from "./types";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

export const URL_KEYS = {
  sort: "sort",
  sizes: "rozmiar",
  priceRanges: "cena",
  colors: "kolor",
  externalMaterials: "material",
  fastenings: "zapiecie",
  query: "q",
  rootCategory: "plec",
  categoryId: "kategoria",
} as const;

/** Filter keys that ListingFiltersState owns (excludes `q`). */
export const LISTING_FILTER_URL_KEYS = [
  URL_KEYS.sort,
  URL_KEYS.sizes,
  URL_KEYS.priceRanges,
  URL_KEYS.colors,
  URL_KEYS.externalMaterials,
  URL_KEYS.fastenings,
  URL_KEYS.rootCategory,
  URL_KEYS.categoryId,
] as const;

const SORT_URL_VALUES: Record<ListingSort, string> = {
  default: "domyslne",
  priceAsc: "cena-rosnaco",
  priceDesc: "cena-malejaco",
};

const SORT_FROM_URL: Record<string, ListingSort> = {
  domyslne: "default",
  "cena-rosnaco": "priceAsc",
  "cena-malejaco": "priceDesc",
};

/** Join list values; URLSearchParams handles encoding. Values must not contain commas. */
const encodeList = (values: string[]): string => values.join(",");

const decodeList = (raw: string | null): string[] => {
  if (!raw) return [];
  return raw
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);
};

export const serializeListingFiltersToSearchParams = (
  state: ListingFiltersState,
  base?: URLSearchParams,
): URLSearchParams => {
  const params = base
    ? new URLSearchParams(base.toString())
    : new URLSearchParams();

  for (const key of LISTING_FILTER_URL_KEYS) {
    params.delete(key);
  }

  if (state.sort !== "default") {
    params.set(URL_KEYS.sort, SORT_URL_VALUES[state.sort]);
  }
  if (state.sizes.length > 0) {
    params.set(URL_KEYS.sizes, encodeList(state.sizes));
  }
  if (state.priceRanges.length > 0) {
    params.set(
      URL_KEYS.priceRanges,
      encodeList(state.priceRanges.map(priceRangeToKey)),
    );
  }
  if (state.colors.length > 0) {
    params.set(URL_KEYS.colors, encodeList(state.colors));
  }
  if (state.externalMaterials.length > 0) {
    params.set(URL_KEYS.externalMaterials, encodeList(state.externalMaterials));
  }
  if (state.fastenings.length > 0) {
    params.set(URL_KEYS.fastenings, encodeList(state.fastenings));
  }
  if (state.rootCategory && state.rootCategory in ROOT_CATEGORY_URL_VALUES) {
    params.set(
      URL_KEYS.rootCategory,
      ROOT_CATEGORY_URL_VALUES[
        state.rootCategory as keyof typeof ROOT_CATEGORY_URL_VALUES
      ],
    );
  }
  if (state.categoryId) {
    params.set(URL_KEYS.categoryId, state.categoryId);
  }

  return params;
};

export const parseListingFiltersFromSearch = (
  search: string,
): ListingFiltersState => {
  const params = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );

  const sortRaw = params.get(URL_KEYS.sort);
  const sort: ListingSort =
    (sortRaw && SORT_FROM_URL[sortRaw]) || "default";

  const priceRanges = decodeList(params.get(URL_KEYS.priceRanges))
    .map(parsePriceRangeKey)
    .filter((r): r is PriceRange => r !== null);

  const plecRaw = params.get(URL_KEYS.rootCategory);
  const rootCategory: RootCategory | undefined =
    (plecRaw && ROOT_CATEGORY_FROM_URL[plecRaw]) || undefined;

  const categoryId = params.get(URL_KEYS.categoryId)?.trim() || undefined;

  return {
    sort,
    sizes: decodeList(params.get(URL_KEYS.sizes)),
    priceRanges,
    colors: decodeList(params.get(URL_KEYS.colors)),
    externalMaterials: decodeList(params.get(URL_KEYS.externalMaterials)),
    fastenings: decodeList(params.get(URL_KEYS.fastenings)),
    rootCategory,
    categoryId,
  };
};

export const rootCategoryToUrlSlug = (
  root: RootCategory | undefined,
): string | undefined => {
  if (!root || !(root in ROOT_CATEGORY_URL_VALUES)) return undefined;
  return ROOT_CATEGORY_URL_VALUES[
    root as keyof typeof ROOT_CATEGORY_URL_VALUES
  ];
};
