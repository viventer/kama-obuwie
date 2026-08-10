"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CategoryProductsListing from "@/components/store/listing/CategoryProductsListing";
import ListingPageSkeleton from "@/components/store/listing/ListingPageSkeleton";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import {
  SEARCH_LISTING_LIMIT,
  SEARCH_MIN_QUERY_LENGTH,
} from "@/lib/search/constants";

export type PopularCategoryLink = {
  id: string;
  label: string;
};

function EmptyListingState({
  heading,
  message,
  popularCategories,
}: {
  heading: string;
  message: string;
  popularCategories: PopularCategoryLink[];
}) {
  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 mt-4">
      <SubpageHeading text={heading} />
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {popularCategories.length > 0 && (
        <div>
          <p className="font-medium mb-2">Popularne kategorie</p>
          <ul className="flex flex-wrap gap-2">
            {popularCategories.slice(0, 8).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/listing/${category.id}`}
                  className="inline-flex rounded-xs bg-foreground/10 px-3 py-1.5 text-sm hover:bg-primary/20"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function CatalogListingView({
  products,
  categoryLabels,
  popularCategories,
  heading = "Wszystkie produkty",
  defaultSortLabel = "Domyślne",
}: {
  products: ProductListingData[];
  categoryLabels: Record<string, string>;
  popularCategories: PopularCategoryLink[];
  heading?: string;
  defaultSortLabel?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyListingState
        heading={heading}
        message="Brak aktywnych produktów."
        popularCategories={popularCategories}
      />
    );
  }

  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 mt-4">
      <SubpageHeading text={heading} />
      <CategoryProductsListing
        products={products}
        enableCategoryFilter
        categoryLabels={categoryLabels}
        defaultSortLabel={defaultSortLabel}
      />
    </div>
  );
}

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
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") || "").trim();
  const isSearch = q.length >= SEARCH_MIN_QUERY_LENGTH;

  const [searchResults, setSearchResults] = useState<
    ProductListingData[] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const heading = `Wyniki dla „${q}”`;

  if (isLoading || searchResults === null) {
    return <ListingPageSkeleton productCount={12} />;
  }

  if (searchResults.length === 0) {
    return (
      <EmptyListingState
        heading={heading}
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
      heading={heading}
      defaultSortLabel="Trafność"
    />
  );
}
