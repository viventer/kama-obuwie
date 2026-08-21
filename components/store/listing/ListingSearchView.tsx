"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import CatalogListingView from "@/components/store/listing/CatalogListingView";
import EmptyListingState, {
  type PopularCategoryLink,
} from "@/components/store/listing/EmptyListingState";
import ListingPageSkeleton from "@/components/store/listing/ListingPageSkeleton";
import SearchHeading from "@/components/store/listing/SearchHeading";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import {
  SEARCH_LISTING_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/search/constants";

/**
 * Reads `q` on the client so the `/listing` server page can stay ISR.
 * Search hits are loaded from `/api/store/search` only when `q` is present.
 */
export default function ListingSearchView({
  catalogProducts,
  categoryLabels,
  popularCategories,
}: {
  catalogProducts: ProductListingData[];
  categoryLabels: Record<string, string>;
  popularCategories: PopularCategoryLink[];
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const isSearch = q.length >= SEARCH_MIN_QUERY_LENGTH;

  const [searchResults, setSearchResults] = useState<
    ProductListingData[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

  const clearSearchQuery = useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    params.delete("q");
    const qs = params.toString();
    router.replace(
      qs ? `${window.location.pathname}?${qs}` : window.location.pathname,
      { scroll: false },
    );
  }, [router]);

  useEffect(() => {
    if (!isSearch) {
      setSearchResults(null);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setSearchResults(null);

    const params = new URLSearchParams({
      q,
      limit: String(SEARCH_LISTING_LIMIT),
    });

    // Do not pass `plec` — gender filtering stays in ListingFiltersProvider
    // so in-page filter toggles work without refetching search.
    fetch(`/api/store/search?${params.toString()}`, {
      method: "GET",
      cache: "no-store",
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`search HTTP ${res.status}`);
        return res.json() as Promise<{ results: ProductListingData[] }>;
      })
      .then((data) => {
        if (!cancelled) setSearchResults(data.results || []);
      })
      .catch((error) => {
        console.error("Listing search failed:", error);
        if (!cancelled) setSearchResults([]);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [q, isSearch]);

  if (!isSearch) {
    return (
      <CatalogListingView
        products={catalogProducts}
        categoryLabels={categoryLabels}
        popularCategories={popularCategories}
      />
    );
  }

  const headingNode = <SearchHeading q={q} onClear={clearSearchQuery} />;

  if (isLoading || searchResults === null) {
    return <ListingPageSkeleton productCount={12} />;
  }

  if (searchResults.length === 0) {
    return (
      <EmptyListingState
        headingNode={headingNode}
        message="Nie znaleziono produktów pasujących do wyszukiwania."
        popularCategories={popularCategories}
      />
    );
  }

  return (
    <CatalogListingView
      products={searchResults}
      categoryLabels={categoryLabels}
      popularCategories={popularCategories}
      headingNode={headingNode}
      defaultSortLabel="Trafność"
    />
  );
}
