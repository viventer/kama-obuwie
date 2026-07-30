"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  formatPriceRangeLabel,
  priceRangeToKey,
} from "@/helpers/prices";
import { useListingFilters } from "./ListingFiltersContext";

type SelectedGroup = {
  label: string;
  items: { key: string; label: string; onRemove: () => void }[];
};

export default function SelectedFiltersContent({
  showClearAll = false,
}: {
  showClearAll?: boolean;
}) {
  const {
    state,
    removeSize,
    removePriceRange,
    removeColor,
    removeExternalMaterial,
    removeFastening,
    clearAll,
    activeFilterCount,
  } = useListingFilters();

  const groups: SelectedGroup[] = [];

  if (state.sizes.length > 0) {
    groups.push({
      label: "Rozmiar",
      items: state.sizes.map((size) => ({
        key: `size-${size}`,
        label: size,
        onRemove: () => removeSize(size),
      })),
    });
  }

  if (state.priceRanges.length > 0) {
    groups.push({
      label: "Cena",
      items: state.priceRanges.map((range) => {
        const key = priceRangeToKey(range);
        return {
          key: `price-${key}`,
          label: formatPriceRangeLabel(range),
          onRemove: () => removePriceRange(key),
        };
      }),
    });
  }

  if (state.colors.length > 0) {
    groups.push({
      label: "Kolor",
      items: state.colors.map((color) => ({
        key: `color-${color}`,
        label: color,
        onRemove: () => removeColor(color),
      })),
    });
  }

  if (state.externalMaterials.length > 0) {
    groups.push({
      label: "Materiał zewnętrzny",
      items: state.externalMaterials.map((material) => ({
        key: `material-${material}`,
        label: material,
        onRemove: () => removeExternalMaterial(material),
      })),
    });
  }

  if (state.fastenings.length > 0) {
    groups.push({
      label: "Zapięcie",
      items: state.fastenings.map((fastening) => ({
        key: `fastening-${fastening}`,
        label: fastening,
        onRemove: () => removeFastening(fastening),
      })),
    });
  }

  if (groups.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Brak wybranych filtrów.</p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="font-medium mb-2 text-sm">{group.label}</p>
          <ul className="flex flex-wrap gap-2">
            {group.items.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  onClick={item.onRemove}
                  className="inline-flex items-center gap-1.5 rounded-xs bg-foreground/10 px-2.5 py-1.5 text-sm cursor-pointer hover:bg-primary/20"
                >
                  <span>{item.label}</span>
                  <span
                    className="inline-flex size-4 items-center justify-center rounded-full bg-secondary text-secondary-foreground"
                    aria-hidden
                  >
                    <X className="size-2.5" />
                  </span>
                  <span className="sr-only">Usuń {item.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {showClearAll && activeFilterCount > 0 && (
        <Button
          type="button"
          variant="important"
          className="w-full mt-1"
          onClick={clearAll}
        >
          Wyczyść wszystkie
        </Button>
      )}
    </div>
  );
}
