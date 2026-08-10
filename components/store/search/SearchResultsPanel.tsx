"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import SearchResultRow from "./SearchResultRow";
import { useStoreSearch } from "./StoreSearchContext";
import SearchRootCategoryToggle from "./SearchRootCategoryToggle";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/search/constants";
import { cn } from "@/lib/utils";

export default function SearchResultsPanel({
  className,
}: {
  className?: string;
}) {
  const {
    query,
    results,
    isSearching,
    buildResultsHref,
    closeSearch,
  } = useStoreSearch();

  const trimmed = query.trim();
  const canSubmit = trimmed.length >= SEARCH_MIN_QUERY_LENGTH;

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <div className="shrink-0 border-b border-border bg-background px-3 py-2 sm:px-3 sm:pt-3 sm:pb-2">
        <SearchRootCategoryToggle />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
        {!canSubmit ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            Wpisz co najmniej {SEARCH_MIN_QUERY_LENGTH} znaki, aby wyszukać
            produkty.
          </p>
        ) : isSearching && results.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            Szukam…
          </p>
        ) : results.length === 0 ? (
          <p className="px-4 py-6 text-sm text-muted-foreground text-center">
            Brak wyników dla „{trimmed}”.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {results.map((product) => (
              <li key={product.docId}>
                <SearchResultRow
                  product={product}
                  onNavigate={() => closeSearch()}
                />
              </li>
            ))}
          </ul>
        )}
      </div>

      {canSubmit && (
        <div className="shrink-0 border-t border-border bg-background p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <Button asChild variant="important" className="w-full">
            <Link href={buildResultsHref()} onClick={() => closeSearch()}>
              Pokaż wszystkie
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
