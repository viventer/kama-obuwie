"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ProductType,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

const rootCategoryOptionsByProductType: Record<
  ProductType,
  { label: string; value: RootCategory }[]
> = {
  obuwie: [
    { label: "Męskie", value: "obuwie męskie" },
    { label: "Damskie", value: "obuwie damskie" },
    { label: "Dziecięce", value: "obuwie dziecięce" },
  ],
  akcesoria: [
    { label: "Akcesoria", value: "akcesoria" },
    { label: "Akcesoria dziecięce", value: "akcesoria dziecięce" },
  ],
};

export default function RootCategoryFilterSelector({
  rootCategoryFilter,
  setRootCategoryFilter,
  setColumnFilters,
  productType,
  onRootCategoryChange,
}: {
  rootCategoryFilter: RootCategory | "all";
  setRootCategoryFilter: Dispatch<SetStateAction<RootCategory | "all">>;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  productType: ProductType;
  onRootCategoryChange?: (value: RootCategory | "all") => void;
}) {
  const options = rootCategoryOptionsByProductType[productType];

  return (
    <Select
      value={rootCategoryFilter}
      onValueChange={(value) => {
        const nextValue = value as RootCategory | "all";
        setRootCategoryFilter(nextValue);
        onRootCategoryChange?.(nextValue);

        setColumnFilters((prev) => {
          const withoutRootCategory = prev.filter(
            (filter) => filter.id !== "rootCategory",
          );
          if (nextValue === "all") return withoutRootCategory;
          return [
            ...withoutRootCategory,
            { id: "rootCategory", value: nextValue },
          ];
        });
      }}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Kategoria główna" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

export function getRootCategoriesForProductType(
  productType: ProductType,
): RootCategory[] {
  return rootCategoryOptionsByProductType[productType].map(
    (option) => option.value,
  );
}
