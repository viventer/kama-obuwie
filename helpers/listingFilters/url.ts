import { PriceRange, parsePriceRangeKey, priceRangeToKey } from "@/helpers/prices";
import { ListingFiltersState, ListingSort } from "./types";

const URL_KEYS = {
  sort: "sort",
  sizes: "rozmiar",
  priceRanges: "cena",
  colors: "kolor",
  externalMaterials: "material",
  fastenings: "zapiecie",
} as const;

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
): URLSearchParams => {
  const params = new URLSearchParams();

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

  return {
    sort,
    sizes: decodeList(params.get(URL_KEYS.sizes)),
    priceRanges,
    colors: decodeList(params.get(URL_KEYS.colors)),
    externalMaterials: decodeList(params.get(URL_KEYS.externalMaterials)),
    fastenings: decodeList(params.get(URL_KEYS.fastenings)),
  };
};
