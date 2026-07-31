"use client";

import { cubicBezier, motion } from "framer-motion";
import { X } from "lucide-react";
import FilterChipGroup from "../FilterChipGroup";
import PriceRangeChipGroup, { toSizeChipOptions } from "../PriceRangeChipGroup";
import SortSelector from "../SortSelector";
import { useListingFilters } from "../ListingFiltersContext";

export type MobileFilterPanel = "sort" | "size" | "price";

const PANEL_TITLES: Record<MobileFilterPanel, string> = {
  sort: "Sortowanie",
  size: "Wybierz rozmiar",
  price: "Wybierz przedział cenowy",
};

export default function MobileFilterBarPanel({
  panel,
  onClose,
}: {
  panel: MobileFilterPanel;
  onClose: () => void;
}) {
  const { state, facets, setSort, setSizes, setPriceRanges } =
    useListingFilters();

  return (
    // The wrapper clips the panel so it slides out from behind the nav bar.
    <div className="absolute bottom-full inset-x-0 overflow-hidden">
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ duration: 0.3, ease: cubicBezier(0.22, 1, 0.36, 1) }}
        className="border-t border-border bg-background pb-2 will-change-transform"
      >
        <div className="relative mx-auto w-[90vw] max-w-[1440px] px-1 pt-3 pb-8">
          <p className="text-center font-medium text-base mb-4">
            {PANEL_TITLES[panel]}
          </p>
          <button
            type="button"
            onClick={onClose}
            className="absolute right-0 top-3 p-1 rounded-xs hover:bg-foreground/10 cursor-pointer"
            aria-label="Zamknij"
          >
            <X className="size-4" />
          </button>

          <div>
            {panel === "sort" && (
              <SortSelector
                value={state.sort}
                onChange={(sort) => {
                  setSort(sort);
                  onClose();
                }}
              />
            )}

            {panel === "size" && facets.sizes.length > 0 && (
              <FilterChipGroup
                options={toSizeChipOptions(facets.sizes)}
                selected={state.sizes}
                onChange={setSizes}
                itemClassName="size-10 min-w-10 px-0"
              />
            )}

            {panel === "price" && facets.priceRanges.length > 0 && (
              <PriceRangeChipGroup
                ranges={facets.priceRanges}
                selected={state.priceRanges}
                onChange={setPriceRanges}
              />
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
