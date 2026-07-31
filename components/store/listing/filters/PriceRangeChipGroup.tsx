"use client";

import {
  formatPriceRangeLabel,
  priceRangeToKey,
  type PriceRange,
} from "@/helpers/prices";
import type { ListingSizeFacet } from "@/helpers/listingFilters/types";
import FilterChipGroup, { type FilterChipOption } from "./FilterChipGroup";

export const toChipOptions = (values: string[]): FilterChipOption[] =>
  values.map((value) => ({ value, label: value }));

export const toSizeChipOptions = (
  sizes: ListingSizeFacet[],
): FilterChipOption[] =>
  sizes.map((size) => ({
    value: size.value,
    label: size.value,
    disabled: !size.available,
  }));

export default function PriceRangeChipGroup({
  ranges,
  selected,
  onChange,
}: {
  ranges: PriceRange[];
  selected: PriceRange[];
  onChange: (ranges: PriceRange[]) => void;
}) {
  return (
    <FilterChipGroup
      options={ranges.map((range) => ({
        value: priceRangeToKey(range),
        label: formatPriceRangeLabel(range),
      }))}
      selected={selected.map(priceRangeToKey)}
      onChange={(keys) => {
        onChange(ranges.filter((r) => keys.includes(priceRangeToKey(r))));
      }}
    />
  );
}
