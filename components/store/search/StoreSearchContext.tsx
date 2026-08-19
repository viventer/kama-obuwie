"use client";

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import type { RankedSearchHit } from "@/lib/search/ranking";
import { ROOT_CATEGORY_FROM_URL } from "@/helpers/listingFilters/types";
import { rootCategoryToUrlSlug } from "@/helpers/listingFilters/url";
import {
  SEARCH_DEBOUNCE_MS,
  SEARCH_INSTANT_DISPLAY_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/search/constants";
import { isShoeRootCategory } from "@/lib/search/types";

type StoreSearchContextValue = {
  isOpen: boolean;
  query: string;
  rootCategory: RootCategory | undefined;
  results: RankedSearchHit[];
  isSearching: boolean;
  openSearch: () => void;
  closeSearch: (options?: { resetQueryToUrl?: boolean }) => void;
  setQuery: (query: string) => void;
  setRootCategory: (root: RootCategory | undefined) => void;
  buildResultsHref: (overrideQuery?: string) => string;
};

const StoreSearchContext = createContext<StoreSearchContextValue | null>(null);

const noopSearchValue: StoreSearchContextValue = {
  isOpen: false,
  query: "",
  rootCategory: undefined,
  results: [],
  isSearching: false,
  openSearch: () => {},
  closeSearch: () => {},
  setQuery: () => {},
  setRootCategory: () => {},
  buildResultsHref: () => "/listing",
};

/** Prerender-safe shell until useSearchParams resolves. */
function StoreSearchProviderFallback({ children }: { children: ReactNode }) {
  return (
    <StoreSearchContext.Provider value={noopSearchValue}>
      {children}
    </StoreSearchContext.Provider>
  );
}

export function StoreSearchProvider({ children }: { children: ReactNode }) {
  return (
    <Suspense fallback={<StoreSearchProviderFallback>{children}</StoreSearchProviderFallback>}>
      <StoreSearchProviderInner>{children}</StoreSearchProviderInner>
    </Suspense>
  );
}

function StoreSearchProviderInner({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const urlQuery = (searchParams.get("q") || "").trim();
  const urlPlec = searchParams.get("plec");

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQueryState] = useState(urlQuery);
  const [rootCategory, setRootCategory] = useState<RootCategory | undefined>(
    urlPlec ? ROOT_CATEGORY_FROM_URL[urlPlec] : undefined,
  );
  const [allHits, setAllHits] = useState<RankedSearchHit[]>([]);
  const [hitsByRoot, setHitsByRoot] = useState<
    Partial<Record<RootCategory, RankedSearchHit[]>>
  >({});
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);
  const isOpenRef = useRef(false);
  isOpenRef.current = isOpen;

  // Keep input in sync with /listing?q=... when overlay is closed
  // (browser back, Enter navigation, landing on results). While typing
  // with overlay open, do not overwrite the draft query from the old URL.
  useEffect(() => {
    if (isOpenRef.current) return;
    setQueryState(urlQuery);
    setRootCategory(urlPlec ? ROOT_CATEGORY_FROM_URL[urlPlec] : undefined);
    if (!urlQuery) {
      setAllHits([]);
      setHitsByRoot({});
    }
  }, [urlQuery, urlPlec, pathname]);

  const openSearch = useCallback(() => setIsOpen(true), []);
  const closeSearch = useCallback(
    (options?: { resetQueryToUrl?: boolean }) => {
      setIsOpen(false);
      setAllHits([]);
      setHitsByRoot({});
      // After Enter→navigate, keep typed query; URL sync will catch up.
      // When dismissing overlay without navigate, snap back to page q.
      if (options?.resetQueryToUrl === false) return;
      if (!urlQuery) {
        setQueryState("");
        setRootCategory(undefined);
      } else {
        setQueryState(urlQuery);
        setRootCategory(urlPlec ? ROOT_CATEGORY_FROM_URL[urlPlec] : undefined);
      }
    },
    [urlQuery, urlPlec],
  );

  const setQuery = useCallback((next: string) => {
    setQueryState(next);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    const trimmed = query.trim();
    if (!isOpen) {
      setIsSearching(false);
      return;
    }

    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) {
      setAllHits([]);
      setHitsByRoot({});
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const requestId = ++requestIdRef.current;

    debounceRef.current = setTimeout(async () => {
      try {
        const params = new URLSearchParams({
          q: trimmed,
          limit: String(SEARCH_INSTANT_DISPLAY_LIMIT),
          groupByRoot: "1",
        });

        // GET /api/store/search — not a Server Action, so Network tab shows
        // the actual q= being searched (not the stale page URL).
        // No `plec`: one unfiltered search fills every gender bucket so
        // toggling Damskie/Męskie is instant client-side filtering.
        const res = await fetch(`/api/store/search?${params.toString()}`, {
          method: "GET",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`search HTTP ${res.status}`);
        const data = (await res.json()) as {
          results: RankedSearchHit[];
          byRootCategory?: Partial<Record<RootCategory, RankedSearchHit[]>>;
        };
        if (requestId === requestIdRef.current) {
          setAllHits(data.results || []);
          setHitsByRoot(data.byRootCategory || {});
        }
      } catch (error) {
        console.error("Search failed:", error);
        if (requestId === requestIdRef.current) {
          setAllHits([]);
          setHitsByRoot({});
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsSearching(false);
        }
      }
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, isOpen]);

  const results = useMemo(() => {
    if (rootCategory && isShoeRootCategory(rootCategory)) {
      const grouped = hitsByRoot[rootCategory];
      if (grouped !== undefined) return grouped;
      return allHits
        .filter((hit) => hit.rootCategory === rootCategory)
        .slice(0, SEARCH_INSTANT_DISPLAY_LIMIT);
    }
    return allHits;
  }, [allHits, hitsByRoot, rootCategory]);

  const buildResultsHref = useCallback(
    (overrideQuery?: string) => {
      const params = new URLSearchParams();
      const trimmed = (overrideQuery ?? query).trim();
      if (trimmed) params.set("q", trimmed);
      const slug = rootCategoryToUrlSlug(rootCategory);
      if (slug) params.set("plec", slug);
      const qs = params.toString();
      return qs ? `/listing?${qs}` : "/listing";
    },
    [query, rootCategory],
  );

  const value = useMemo(
    () => ({
      isOpen,
      query,
      rootCategory,
      results,
      isSearching,
      openSearch,
      closeSearch,
      setQuery,
      setRootCategory,
      buildResultsHref,
    }),
    [
      isOpen,
      query,
      rootCategory,
      results,
      isSearching,
      openSearch,
      closeSearch,
      setQuery,
      buildResultsHref,
    ],
  );

  return (
    <StoreSearchContext.Provider value={value}>
      {children}
    </StoreSearchContext.Provider>
  );
}

export function useStoreSearch(): StoreSearchContextValue {
  const ctx = useContext(StoreSearchContext);
  if (!ctx) {
    throw new Error("useStoreSearch must be used within StoreSearchProvider");
  }
  return ctx;
}
