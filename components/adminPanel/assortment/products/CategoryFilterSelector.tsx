"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CategoryWithId,
  ProductType,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Dispatch, SetStateAction, useMemo } from "react";
import { getRootCategoriesForProductType } from "./RootCategoryFilterSelector";

export default function CategoryFilterSelector({
  categoryFilter,
  setCategoryFilter,
  setColumnFilters,
  categories,
  rootCategoryFilter,
  productType,
}: {
  categoryFilter: string | "all";
  setCategoryFilter: Dispatch<SetStateAction<string | "all">>;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
  categories: CategoryWithId[];
  rootCategoryFilter: RootCategory | "all";
  productType: ProductType;
}) {
  const availableCategories = useMemo(() => {
    const rootCategoriesForProductType =
      getRootCategoriesForProductType(productType);

    return categories
      .filter((category) => {
        if (rootCategoryFilter !== "all") {
          return category.rootCategory === rootCategoryFilter;
        }
        return rootCategoriesForProductType.includes(category.rootCategory);
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [categories, rootCategoryFilter, productType]);

  return (
    <Select
      value={categoryFilter}
      disabled={availableCategories.length === 0}
      onValueChange={(value) => {
        const nextValue = value as string | "all";
        setCategoryFilter(nextValue);

        setColumnFilters((prev) => {
          const withoutCategory = prev.filter(
            (filter) => filter.id !== "categoryId",
          );
          if (nextValue === "all") return withoutCategory;
          return [...withoutCategory, { id: "categoryId", value: nextValue }];
        });
      }}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Kategoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie kategorie</SelectItem>
        {availableCategories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
