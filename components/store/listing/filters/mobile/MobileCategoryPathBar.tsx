"use client";

import { useMemo } from "react";
import { ChevronLeft } from "lucide-react";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { ROOT_CATEGORY_LABELS } from "@/helpers/listingFilters/types";
import FilterChipGroup from "../FilterChipGroup";
import { useListingFilters } from "../ListingFiltersContext";

const ROOT_ORDER: (keyof typeof ROOT_CATEGORY_LABELS)[] = [
  "obuwie męskie",
  "obuwie damskie",
  "obuwie dziecięce",
];

const rootLabel = (root: RootCategory | undefined): string | undefined => {
  if (!root || !(root in ROOT_CATEGORY_LABELS)) return undefined;
  return ROOT_CATEGORY_LABELS[root as keyof typeof ROOT_CATEGORY_LABELS];
};

export default function MobileCategoryPathBar() {
  const {
    enableCategoryFilter,
    isSearchListing,
    state,
    facets,
    filteredProducts,
    categoryLabels,
    setRootCategory,
    setCategoryId,
    clearRootCategory,
    clearCategoryId,
  } = useListingFilters();

  const genderOptions = useMemo(() => {
    const present = new Set<string>();
    for (const product of filteredProducts) {
      if (product.rootCategory && product.rootCategory in ROOT_CATEGORY_LABELS) {
        present.add(product.rootCategory);
      }
    }
    return ROOT_ORDER.filter((root) => present.has(root)).map((root) => ({
      value: root,
      label: ROOT_CATEGORY_LABELS[root],
    }));
  }, [filteredProducts]);

  if (!enableCategoryFilter || !isSearchListing) return null;

  const hasCategory = Boolean(state.categoryId);
  const hasRoot = Boolean(state.rootCategory);
  const showPath = hasRoot || hasCategory;

  const currentLabel = hasCategory
    ? categoryLabels[state.categoryId!] || state.categoryId
    : rootLabel(state.rootCategory);

  const parentLabel = hasCategory
    ? rootLabel(state.rootCategory) || "Wszystkie kategorie"
    : "Wszystkie kategorie";

  const categoryOptions = facets.categories.map((category) => ({
    value: category.id,
    label: category.label,
  }));

  return (
    <div className="md:hidden mb-3">
      {showPath && (
        <>
          <button
            type="button"
            onClick={() => {
              if (state.categoryId) {
                clearCategoryId();
                return;
              }
              clearRootCategory();
            }}
            aria-label={`Wróć do: ${parentLabel}`}
            className="inline-flex items-center gap-0.5 -ml-1 mb-1 text-sm font-medium cursor-pointer hover:text-primary"
          >
            <ChevronLeft className="size-4" />
            {parentLabel}
          </button>
          {currentLabel && (
            <p className="text-sm text-muted-foreground mb-2">
              W kategorii „
              <span className="capitalize">{currentLabel}</span>”
            </p>
          )}
        </>
      )}

      {!hasRoot && !hasCategory && genderOptions.length > 0 && (
        <FilterChipGroup
          type="single"
          options={genderOptions}
          selected=""
          onChange={(value) => {
            if (!value) return;
            setRootCategory(value as RootCategory);
          }}
        />
      )}

      {hasRoot && !hasCategory && categoryOptions.length > 0 && (
        <FilterChipGroup
          type="single"
          options={categoryOptions}
          selected=""
          itemClassName="capitalize"
          onChange={(value) => {
            if (!value) return;
            setCategoryId(value);
          }}
        />
      )}
    </div>
  );
}
