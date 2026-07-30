"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  ListingSort,
  SORT_OPTIONS,
} from "@/helpers/listingFilters/types";

export default function SortSelector({
  value,
  onChange,
  className,
}: {
  value: ListingSort;
  onChange: (sort: ListingSort) => void;
  className?: string;
}) {
  return (
    <ul className={cn("flex flex-col gap-2 w-full", className)}>
      {SORT_OPTIONS.map((option) => {
        const isActive = value === option.value;
        return (
          <li key={option.value}>
            <button
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "w-full flex items-center justify-between gap-2 rounded-xs px-4 py-2.5 text-left text-base cursor-pointer transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-foreground/10 text-foreground hover:bg-primary/30",
              )}
            >
              <span>{option.label}</span>
              {isActive && <Check className="size-4 shrink-0" aria-hidden />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
