"use client";

import {
  ArrowDownUp,
  Funnel,
  Layers,
  Link2,
  Palette,
  Ruler,
  Tag,
  type LucideIcon,
} from "lucide-react";
import { useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStickyHeaderOffset } from "@/hooks/useStickyHeaderOffset";
import FilterChipGroup, { type FilterChipOption } from "./FilterChipGroup";
import PriceRangeChipGroup, {
  toChipOptions,
  toSizeChipOptions,
} from "./PriceRangeChipGroup";
import SortSelector from "./SortSelector";
import SelectedFiltersContent from "./SelectedFiltersContent";
import { useListingFilters } from "./ListingFiltersContext";
import DesktopFilterPopover, {
  desktopFilterTriggerClass,
} from "./desktop/DesktopFilterPopover";
import DesktopAllFiltersSheet from "./desktop/DesktopAllFiltersSheet";

type ChipFilterId = "size" | "color" | "material" | "fastening";

type ChipFilterConfig = {
  id: ChipFilterId;
  label: string;
  title: string;
  icon: LucideIcon;
  options: FilterChipOption[];
  selected: string[];
  onChange: (values: string[]) => void;
  itemClassName?: string;
};

type OpenPopover = "sort" | "price" | ChipFilterId | "selected" | null;

export default function DesktopFiltersBar() {
  const {
    state,
    facets,
    setSort,
    setSizes,
    setPriceRanges,
    setColors,
    setExternalMaterials,
    setFastenings,
    activeFilterCount,
  } = useListingFilters();

  const headerOffset = useStickyHeaderOffset();
  const [openPopover, setOpenPopover] = useState<OpenPopover>(null);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);

  const setPopover = (id: Exclude<OpenPopover, null>) => (open: boolean) => {
    setOpenPopover(open ? id : null);
  };

  const chipFilters = (
    [
      {
        id: "size" as const,
        label: "Rozmiar",
        title: "Wybierz rozmiar",
        icon: Ruler,
        options: toSizeChipOptions(facets.sizes),
        selected: state.sizes,
        onChange: setSizes,
        itemClassName: "size-10 min-w-10 px-0",
      },
      {
        id: "color" as const,
        label: "Kolor",
        title: "Wybierz kolor",
        icon: Palette,
        options: toChipOptions(facets.colors),
        selected: state.colors,
        onChange: setColors,
      },
      {
        id: "material" as const,
        label: "Materiał",
        title: "Wybierz materiał zewnętrzny",
        icon: Layers,
        options: toChipOptions(facets.externalMaterials),
        selected: state.externalMaterials,
        onChange: setExternalMaterials,
      },
      {
        id: "fastening" as const,
        label: "Zapięcie",
        title: "Wybierz zapięcie",
        icon: Link2,
        options: toChipOptions(facets.fastenings),
        selected: state.fastenings,
        onChange: setFastenings,
      },
    ] satisfies ChipFilterConfig[]
  ).filter((filter) => filter.options.length > 0);

  // Keep original order: size → price → color → material → fastening
  const sizeFilter = chipFilters.find((f) => f.id === "size");
  const otherChipFilters = chipFilters.filter((f) => f.id !== "size");

  const renderChipPopover = (filter: ChipFilterConfig) => (
    <DesktopFilterPopover
      key={filter.id}
      label={filter.label}
      icon={filter.icon}
      open={openPopover === filter.id}
      onOpenChange={setPopover(filter.id)}
      hasSelection={filter.selected.length > 0}
      title={filter.title}
    >
      <FilterChipGroup
        options={filter.options}
        selected={filter.selected}
        onChange={filter.onChange}
        itemClassName={filter.itemClassName}
      />
    </DesktopFilterPopover>
  );

  return (
    <>
      <div
        className="hidden md:flex sticky z-40 -mx-0 mb-6 gap-2 items-center flex-wrap py-2 bg-background/95 backdrop-blur-sm"
        style={{ top: headerOffset }}
      >
        <DesktopFilterPopover
          label="Sortuj"
          icon={ArrowDownUp}
          open={openPopover === "sort"}
          onOpenChange={setPopover("sort")}
          hasSelection={state.sort !== "default"}
          showChevron
          contentClassName="w-72"
        >
          <SortSelector
            value={state.sort}
            onChange={(sort) => {
              setSort(sort);
              setOpenPopover(null);
            }}
          />
        </DesktopFilterPopover>

        {sizeFilter && renderChipPopover(sizeFilter)}

        {facets.priceRanges.length > 0 && (
          <DesktopFilterPopover
            label="Cena"
            icon={Tag}
            open={openPopover === "price"}
            onOpenChange={setPopover("price")}
            hasSelection={state.priceRanges.length > 0}
            title="Wybierz przedział cenowy"
            contentClassName="w-96"
          >
            <PriceRangeChipGroup
              ranges={facets.priceRanges}
              selected={state.priceRanges}
              onChange={setPriceRanges}
            />
          </DesktopFilterPopover>
        )}

        {otherChipFilters.map(renderChipPopover)}

        <button
          type="button"
          className={desktopFilterTriggerClass(allFiltersOpen)}
          onClick={() => setAllFiltersOpen(true)}
        >
          <Funnel className="size-4" aria-hidden />
          Wszystkie filtry
        </button>

        {activeFilterCount > 0 && (
          <Popover
            open={openPopover === "selected"}
            onOpenChange={setPopover("selected")}
          >
            <PopoverTrigger asChild>
              <button
                type="button"
                className="ml-2 underline underline-offset-2 text-sm font-medium cursor-pointer hover:text-primary"
              >
                Wybrane filtry ({activeFilterCount})
              </button>
            </PopoverTrigger>
            <PopoverContent
              align="start"
              className="z-[110] w-80 max-h-[60vh] overflow-y-auto bg-card p-4"
            >
              <SelectedFiltersContent showClearAll />
            </PopoverContent>
          </Popover>
        )}
      </div>

      <DesktopAllFiltersSheet
        open={allFiltersOpen}
        onOpenChange={setAllFiltersOpen}
      />
    </>
  );
}
