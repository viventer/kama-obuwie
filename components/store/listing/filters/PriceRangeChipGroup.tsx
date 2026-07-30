"use client";

import {
  formatPriceRangeLabel,
  priceRangeToKey,
  type PriceRange,
} from "@/helpers/prices";
import FilterChipGroup from "./FilterChipGroup";

export const toChipOptions = (values: string[]) =>
  values.map((value) => ({ value, label: value }));

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
