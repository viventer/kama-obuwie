"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColumnFiltersState } from "@tanstack/react-table";
import { Dispatch, SetStateAction } from "react";

export default function SalesChannelFilterSelector({
  salesChannelFilter,
  setSalesChannelFilter,
  setColumnFilters,
}: {
  salesChannelFilter: "AL1" | "AL2" | "POS" | "DTC" | "all";
  setSalesChannelFilter: Dispatch<
    SetStateAction<"all" | "AL1" | "AL2" | "DTC" | "POS">
  >;
  setColumnFilters: Dispatch<SetStateAction<ColumnFiltersState>>;
}) {
  return (
    <Select
      value={salesChannelFilter}
      onValueChange={(value) => {
        const nextValue = value as typeof salesChannelFilter;
        setSalesChannelFilter(nextValue);

        setColumnFilters((prev) => {
          const withoutSalesChannel = prev.filter(
            (filter) => filter.id !== "salesChannel",
          );
          if (nextValue === "all") return withoutSalesChannel;
          return [
            ...withoutSalesChannel,
            { id: "salesChannel", value: nextValue },
          ];
        });
      }}
    >
      <SelectTrigger className="w-[260px]">
        <SelectValue placeholder="Pochodzenie zamówienia" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Wszystkie</SelectItem>
        <SelectItem value="AL1">Allegro 1</SelectItem>
        <SelectItem value="AL2">Allegro 2</SelectItem>
        <SelectItem value="DTC">Sklep internetowy</SelectItem>
        <SelectItem value="POS">Sklep stacjonarny</SelectItem>
      </SelectContent>
    </Select>
  );
}
