"use client";

import FilterChipGroup from "./FilterChipGroup";
import { useListingFilters } from "./ListingFiltersContext";
import { ROOT_CATEGORY_LABELS } from "@/helpers/listingFilters/types";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

const ROOT_OPTIONS: { value: RootCategory; label: string }[] = [
  { value: "obuwie męskie", label: ROOT_CATEGORY_LABELS["obuwie męskie"] },
  { value: "obuwie damskie", label: ROOT_CATEGORY_LABELS["obuwie damskie"] },
  {
    value: "obuwie dziecięce",
    label: ROOT_CATEGORY_LABELS["obuwie dziecięce"],
  },
];

export default function CategoryStageFilters() {
  const {
    enableCategoryFilter,
    state,
    facets,
    setRootCategory,
    setCategoryId,
  } = useListingFilters();

  if (!enableCategoryFilter) return null;

  const rootSelected = state.rootCategory || "all";
  const categoryOptions = state.rootCategory
    ? facets.categories.map((c) => ({
        value: c.id,
        label: `${c.label} (${c.count})`,
      }))
    : [];

  return (
    <div className="flex flex-col gap-4 w-full">
      <div>
        <FilterChipGroup
          type="single"
          options={[
            { value: "all", label: "Wszystkie" },
            ...ROOT_OPTIONS.map((o) => ({
              value: o.value,
              label: o.label,
            })),
          ]}
          selected={rootSelected}
          onChange={(value) => {
            if (!value || value === "all") {
              setRootCategory(undefined);
              return;
            }
            setRootCategory(value as RootCategory);
          }}
        />
      </div>

      {categoryOptions.length > 0 && (
        <div>
          <p className="font-medium mb-2 text-sm">Kategoria</p>
          <FilterChipGroup
            type="single"
            options={[{ value: "all", label: "Wszystkie" }, ...categoryOptions]}
            selected={state.categoryId || "all"}
            itemClassName="capitalize"
            onChange={(value) => {
              if (!value || value === "all") {
                setCategoryId(undefined);
                return;
              }
              setCategoryId(value);
            }}
          />
        </div>
      )}
    </div>
  );
}
