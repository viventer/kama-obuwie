"use client";

import { type ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import PriceRangeChipGroup, {
  toChipOptions,
  toSizeChipOptions,
} from "./PriceRangeChipGroup";
import FilterChipGroup, { type FilterChipOption } from "./FilterChipGroup";
import SortSelector from "./SortSelector";
import { useListingFilters } from "./ListingFiltersContext";

function chipSection({
  id,
  label,
  options,
  selected,
  onChange,
  itemClassName,
}: {
  id: string;
  label: string;
  options: FilterChipOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  itemClassName?: string;
}): { id: string; label: string; content: ReactNode } | null {
  if (options.length === 0) return null;

  return {
    id,
    label,
    content: (
      <FilterChipGroup
        options={options}
        selected={selected}
        onChange={onChange}
        itemClassName={itemClassName}
      />
    ),
  };
}

export default function AllFiltersContent({
  onShowProducts,
}: {
  onShowProducts?: () => void;
}) {
  const {
    state,
    facets,
    setSort,
    setSizes,
    setPriceRanges,
    setColors,
    setExternalMaterials,
    setFastenings,
    clearAll,
    filteredProducts,
  } = useListingFilters();

  const sections = [
    {
      id: "sort",
      label: "Sortowanie",
      content: <SortSelector value={state.sort} onChange={setSort} />,
    },
    chipSection({
      id: "size",
      label: "Rozmiar",
      options: toSizeChipOptions(facets.sizes),
      selected: state.sizes,
      onChange: setSizes,
      itemClassName: "size-10 min-w-10 px-0",
    }),
    facets.priceRanges.length > 0
      ? {
          id: "price",
          label: "Cena",
          content: (
            <PriceRangeChipGroup
              ranges={facets.priceRanges}
              selected={state.priceRanges}
              onChange={setPriceRanges}
            />
          ),
        }
      : null,
    chipSection({
      id: "color",
      label: "Kolor",
      options: toChipOptions(facets.colors),
      selected: state.colors,
      onChange: setColors,
    }),
    chipSection({
      id: "material",
      label: "Materiał zewnętrzny",
      options: toChipOptions(facets.externalMaterials),
      selected: state.externalMaterials,
      onChange: setExternalMaterials,
    }),
    chipSection({
      id: "fastening",
      label: "Zapięcie",
      options: toChipOptions(facets.fastenings),
      selected: state.fastenings,
      onChange: setFastenings,
    }),
  ].filter((section) => section !== null);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex-1 overflow-y-auto overflow-x-hidden scrollbar px-1 pb-4">
        <Accordion type="multiple" defaultValue={[]} className="w-full">
          {sections.map((section) => (
            <AccordionItem
              key={section.id}
              value={section.id}
              className="max-w-none"
            >
              <AccordionTrigger className="text-base font-medium">
                {section.label}
              </AccordionTrigger>
              <AccordionContent>{section.content}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>

      <div className="flex gap-2 pt-3 border-t border-border shrink-0">
        <Button
          type="button"
          variant="secondary"
          className="shrink-0"
          onClick={clearAll}
        >
          Wyczyść
        </Button>
        <Button
          type="button"
          variant="important"
          className="flex-1"
          onClick={onShowProducts}
        >
          Pokaż produkty ({filteredProducts.length})
        </Button>
      </div>
    </div>
  );
}
