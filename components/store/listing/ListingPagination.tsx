"use client";

import type { MouseEvent } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { PAGE_URL_KEY } from "@/helpers/listingFilters/url";
import { useListingFilters } from "./filters/ListingFiltersContext";

type PageItem = number | "ellipsis";

/** Three-page window around current, plus first/last with ellipsis for gaps. */
export const getListingPageItems = (
  current: number,
  total: number,
): PageItem[] => {
  if (total <= 3) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const windowStart = Math.min(Math.max(1, current - 1), total - 2);
  const windowEnd = windowStart + 2;
  const items: PageItem[] = [];

  if (windowStart > 1) {
    items.push(1);
    if (windowStart > 2) items.push("ellipsis");
  }

  for (let n = windowStart; n <= windowEnd; n++) {
    items.push(n);
  }

  if (windowEnd < total) {
    if (windowEnd < total - 1) items.push("ellipsis");
    items.push(total);
  }

  return items;
};

const hrefForPage = (n: number): string => {
  const params = new URLSearchParams(
    typeof window !== "undefined" ? window.location.search : "",
  );
  if (n > 1) {
    params.set(PAGE_URL_KEY, String(n));
  } else {
    params.delete(PAGE_URL_KEY);
  }
  const qs = params.toString();
  const pathname =
    typeof window !== "undefined" ? window.location.pathname : "";
  return qs ? `${pathname}?${qs}` : pathname || "/";
};

const isModifiedClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button !== 0 ||
  event.metaKey ||
  event.ctrlKey ||
  event.shiftKey ||
  event.altKey;

export default function ListingPagination() {
  const { page, totalPages, setPage } = useListingFilters();

  if (totalPages <= 1) return null;

  const goTo = (n: number) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (isModifiedClick(event)) return;
    event.preventDefault();
    if (n < 1 || n > totalPages || n === page) return;
    setPage(n);
    window.scrollTo({ top: 0 });
  };

  const items = getListingPageItems(page, totalPages);
  const prevDisabled = page <= 1;
  const nextDisabled = page >= totalPages;

  return (
    <Pagination className="mt-8" aria-label="Paginacja ofert">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            href={hrefForPage(Math.max(1, page - 1))}
            aria-disabled={prevDisabled}
            tabIndex={prevDisabled ? -1 : undefined}
            className={
              prevDisabled ? "pointer-events-none opacity-50" : undefined
            }
            onClick={prevDisabled ? (e) => e.preventDefault() : goTo(page - 1)}
          />
        </PaginationItem>

        {items.map((item, index) =>
          item === "ellipsis" ? (
            <PaginationItem key={`ellipsis-${index}`}>
              <PaginationEllipsis />
            </PaginationItem>
          ) : (
            <PaginationItem key={item}>
              <PaginationLink
                href={hrefForPage(item)}
                isActive={item === page}
                onClick={goTo(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          ),
        )}

        <PaginationItem>
          <PaginationNext
            href={hrefForPage(Math.min(totalPages, page + 1))}
            aria-disabled={nextDisabled}
            tabIndex={nextDisabled ? -1 : undefined}
            className={
              nextDisabled ? "pointer-events-none opacity-50" : undefined
            }
            onClick={nextDisabled ? (e) => e.preventDefault() : goTo(page + 1)}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
