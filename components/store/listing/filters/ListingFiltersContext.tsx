"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { PriceRange, priceRangeToKey } from "@/helpers/prices";
import { applyListingFilters, countActiveFilters } from "@/helpers/listingFilters/applyFilters";
import { getListingFacets } from "@/helpers/listingFilters/facets";
import {
  DEFAULT_LISTING_FILTERS_STATE,
  type ListingFacets,
  type ListingFiltersState,
  type ListingSort,
} from "@/helpers/listingFilters/types";
import {
  parseListingFiltersFromSearch,
  serializeListingFiltersToSearchParams,
} from "@/helpers/listingFilters/url";

type ListingFiltersContextValue = {
  state: ListingFiltersState;
  facets: ListingFacets;
  filteredProducts: ProductListingData[];
  activeFilterCount: number;
  setSort: (sort: ListingSort) => void;
  setSizes: (sizes: string[]) => void;
  setPriceRanges: (ranges: PriceRange[]) => void;
  setColors: (colors: string[]) => void;
  setExternalMaterials: (materials: string[]) => void;
  setFastenings: (fastenings: string[]) => void;
  removeSize: (size: string) => void;
  removePriceRange: (key: string) => void;
  removeColor: (color: string) => void;
  removeExternalMaterial: (material: string) => void;
  removeFastening: (fastening: string) => void;
  clearAll: () => void;
};

const ListingFiltersContext =
  createContext<ListingFiltersContextValue | null>(null);

const writeFiltersToUrl = (state: ListingFiltersState) => {
  if (typeof window === "undefined") return;
  const params = serializeListingFiltersToSearchParams(state);
  const qs = params.toString();
  const next = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;
  window.history.replaceState(window.history.state, "", next);
};

export function ListingFiltersProvider({
  products,
  rootCategory,
  children,
}: {
  products: ProductListingData[];
  rootCategory?: RootCategory;
  children: ReactNode;
}) {
  const [state, setState] = useState<ListingFiltersState>(
    DEFAULT_LISTING_FILTERS_STATE,
  );
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const fromUrl = parseListingFiltersFromSearch(window.location.search);
    setState(fromUrl);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    writeFiltersToUrl(state);
  }, [state, hydrated]);

  const facets = useMemo(
    () => getListingFacets(products, rootCategory),
    [products, rootCategory],
  );

  const filteredProducts = useMemo(
    () => applyListingFilters(products, state),
    [products, state],
  );

  const activeFilterCount = useMemo(() => countActiveFilters(state), [state]);

  const update = useCallback(
    (patch: Partial<ListingFiltersState>) => {
      setState((prev) => ({ ...prev, ...patch }));
    },
    [],
  );

  const setSort = useCallback(
    (sort: ListingSort) => update({ sort }),
    [update],
  );
  const setSizes = useCallback(
    (sizes: string[]) => update({ sizes }),
    [update],
  );
  const setPriceRanges = useCallback(
    (priceRanges: PriceRange[]) => update({ priceRanges }),
    [update],
  );
  const setColors = useCallback(
    (colors: string[]) => update({ colors }),
    [update],
  );
  const setExternalMaterials = useCallback(
    (externalMaterials: string[]) => update({ externalMaterials }),
    [update],
  );
  const setFastenings = useCallback(
    (fastenings: string[]) => update({ fastenings }),
    [update],
  );

  const removeSize = useCallback(
    (size: string) =>
      setState((prev) => ({
        ...prev,
        sizes: prev.sizes.filter((s) => s !== size),
      })),
    [],
  );

  const removePriceRange = useCallback((key: string) => {
    setState((prev) => ({
      ...prev,
      priceRanges: prev.priceRanges.filter(
        (r) => priceRangeToKey(r) !== key,
      ),
    }));
  }, []);

  const removeColor = useCallback(
    (color: string) =>
      setState((prev) => ({
        ...prev,
        colors: prev.colors.filter((c) => c !== color),
      })),
    [],
  );

  const removeExternalMaterial = useCallback(
    (material: string) =>
      setState((prev) => ({
        ...prev,
        externalMaterials: prev.externalMaterials.filter((m) => m !== material),
      })),
    [],
  );

  const removeFastening = useCallback(
    (fastening: string) =>
      setState((prev) => ({
        ...prev,
        fastenings: prev.fastenings.filter((f) => f !== fastening),
      })),
    [],
  );

  const clearAll = useCallback(() => {
    setState(DEFAULT_LISTING_FILTERS_STATE);
  }, []);

  const value = useMemo<ListingFiltersContextValue>(
    () => ({
      state,
      facets,
      filteredProducts,
      activeFilterCount,
      setSort,
      setSizes,
      setPriceRanges,
      setColors,
      setExternalMaterials,
      setFastenings,
      removeSize,
      removePriceRange,
      removeColor,
      removeExternalMaterial,
      removeFastening,
      clearAll,
    }),
    [
      state,
      facets,
      filteredProducts,
      activeFilterCount,
      setSort,
      setSizes,
      setPriceRanges,
      setColors,
      setExternalMaterials,
      setFastenings,
      removeSize,
      removePriceRange,
      removeColor,
      removeExternalMaterial,
      removeFastening,
      clearAll,
    ],
  );

  return (
    <ListingFiltersContext.Provider value={value}>
      {children}
    </ListingFiltersContext.Provider>
  );
}

export function useListingFilters(): ListingFiltersContextValue {
  const ctx = useContext(ListingFiltersContext);
  if (!ctx) {
    throw new Error(
      "useListingFilters must be used within ListingFiltersProvider",
    );
  }
  return ctx;
}
