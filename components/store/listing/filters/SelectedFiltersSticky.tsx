"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useListingFilters } from "./ListingFiltersContext";
import SelectedFiltersContent from "./SelectedFiltersContent";

export default function SelectedFiltersSticky() {
  const { activeFilterCount } = useListingFilters();

  if (activeFilterCount === 0) {
    return null;
  }

  return (
    <div className="md:hidden mb-3">
      <Popover>
        <PopoverTrigger asChild>
          <button
            type="button"
            className="underline underline-offset-2 text-sm font-medium cursor-pointer hover:text-primary"
          >
            Wybrane filtry ({activeFilterCount})
          </button>
        </PopoverTrigger>
        <PopoverContent
          align="start"
          className="z-[110] w-[min(90vw,22rem)] max-h-[60vh] overflow-y-auto bg-card p-4"
        >
          <SelectedFiltersContent />
        </PopoverContent>
      </Popover>
    </div>
  );
}
