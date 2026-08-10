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
import { useSearchParams } from "next/navigation";
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
  enableCategoryFilter: boolean;
  categoryLabels: Record<string, string>;
  defaultSortLabel?: string;
  setSort: (sort: ListingSort) => void;
  setSizes: (sizes: string[]) => void;
  setPriceRanges: (ranges: PriceRange[]) => void;
  setColors: (colors: string[]) => void;
  setExternalMaterials: (materials: string[]) => void;
  setFastenings: (fastenings: string[]) => void;
  setRootCategory: (root: RootCategory | undefined) => void;
  setCategoryId: (categoryId: string | undefined) => void;
  removeSize: (size: string) => void;
  removePriceRange: (key: string) => void;
  removeColor: (color: string) => void;
  removeExternalMaterial: (material: string) => void;
  removeFastening: (fastening: string) => void;
  clearRootCategory: () => void;
  clearCategoryId: () => void;
  clearAll: () => void;
};

const ListingFiltersContext =
  createContext<ListingFiltersContextValue | null>(null);

const writeFiltersToUrl = (state: ListingFiltersState) => {
  if (typeof window === "undefined") return;
  const current = new URLSearchParams(window.location.search);
  const params = serializeListingFiltersToSearchParams(state, current);
  const qs = params.toString();
  const next = qs
    ? `${window.location.pathname}?${qs}`
    : window.location.pathname;
  window.history.replaceState(window.history.state, "", next);
};

export function ListingFiltersProvider({
  products,
  rootCategory,
  enableCategoryFilter = false,
  categoryLabels = {},
  defaultSortLabel,
  children,
}: {
  products: ProductListingData[];
  rootCategory?: RootCategory;
  enableCategoryFilter?: boolean;
  categoryLabels?: Record<string, string>;
  defaultSortLabel?: string;
  children: ReactNode;
}) {
  const searchParams = useSearchParams();
  const searchKey = searchParams.toString();

  const [state, setState] = useState<ListingFiltersState>(
    DEFAULT_LISTING_FILTERS_STATE,
  );
  const [hydrated, setHydrated] = useState(false);

  // Sync from Next searchParams on mount and when Link/back changes the URL.
  // UI filter edits use history.replaceState (below), which does NOT update
  // useSearchParams — so this won't fight local state changes.
  useEffect(() => {
    const fromUrl = parseListingFiltersFromSearch(
      searchKey ? `?${searchKey}` : "",
    );
    setState(fromUrl);
    setHydrated(true);
  }, [searchKey]);

  useEffect(() => {
    if (!hydrated) return;
    writeFiltersToUrl(state);
  }, [state, hydrated]);

  // Facets for category filter use products after rootCategory filter only,
  // so stage-2 options stay relevant when gender is selected.
  const productsForCategoryFacets = useMemo(() => {
    if (!state.rootCategory) return products;
    return products.filter((p) => p.rootCategory === state.rootCategory);
  }, [products, state.rootCategory]);

  const facets = useMemo(() => {
    const effectiveRoot = state.rootCategory || rootCategory;
    const base = getListingFacets(
      state.rootCategory ? productsForCategoryFacets : products,
      effectiveRoot,
      categoryLabels,
    );
    return base;
  }, [
    products,
    productsForCategoryFacets,
    rootCategory,
    state.rootCategory,
    categoryLabels,
  ]);

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

  const setRootCategory = useCallback(
    (next: RootCategory | undefined) => {
      setState((prev) => ({
        ...prev,
        rootCategory: next,
        // Changing gender clears concrete category
        categoryId: undefined,
      }));
    },
    [],
  );

  const setCategoryId = useCallback(
    (categoryId: string | undefined) => update({ categoryId }),
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

  const clearRootCategory = useCallback(() => {
    setState((prev) => ({
      ...prev,
      rootCategory: undefined,
      categoryId: undefined,
    }));
  }, []);

  const clearCategoryId = useCallback(() => {
    setState((prev) => ({ ...prev, categoryId: undefined }));
  }, []);

  const clearAll = useCallback(() => {
    // Preserve query `q` in URL — clearAll only resets filter state
    setState(DEFAULT_LISTING_FILTERS_STATE);
  }, []);

  const value = useMemo<ListingFiltersContextValue>(
    () => ({
      state,
      facets,
      filteredProducts,
      activeFilterCount,
      enableCategoryFilter,
      categoryLabels,
      defaultSortLabel,
      setSort,
      setSizes,
      setPriceRanges,
      setColors,
      setExternalMaterials,
      setFastenings,
      setRootCategory,
      setCategoryId,
      removeSize,
      removePriceRange,
      removeColor,
      removeExternalMaterial,
      removeFastening,
      clearRootCategory,
      clearCategoryId,
      clearAll,
    }),
    [
      state,
      facets,
      filteredProducts,
      activeFilterCount,
      enableCategoryFilter,
      categoryLabels,
      defaultSortLabel,
      setSort,
      setSizes,
      setPriceRanges,
      setColors,
      setExternalMaterials,
      setFastenings,
      setRootCategory,
      setCategoryId,
      removeSize,
      removePriceRange,
      removeColor,
      removeExternalMaterial,
      removeFastening,
      clearRootCategory,
      clearCategoryId,
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
