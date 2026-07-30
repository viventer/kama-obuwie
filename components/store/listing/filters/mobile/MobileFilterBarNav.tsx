"use client";

import { ArrowDownUp, Funnel, Ruler, Tag, type LucideIcon } from "lucide-react";
import { useListingFilters } from "../ListingFiltersContext";
import MobileFilterBarButton from "./MobileFilterBarButton";
import { type MobileFilterPanel } from "./MobileFilterBarPanel";

type NavButton = {
  id: MobileFilterPanel | "all";
  label: string;
  icon: LucideIcon;
};

export default function MobileFilterBarNav({
  openPanel,
  allFiltersOpen,
  onTogglePanel,
  onOpenAllFilters,
}: {
  openPanel: MobileFilterPanel | null;
  allFiltersOpen: boolean;
  onTogglePanel: (panel: MobileFilterPanel) => void;
  onOpenAllFilters: () => void;
}) {
  const { facets } = useListingFilters();

  const buttons: NavButton[] = [
    { id: "sort", label: "Sortuj", icon: ArrowDownUp },
    ...(facets.sizes.length > 0
      ? [{ id: "size" as const, label: "Rozmiar", icon: Ruler }]
      : []),
    ...(facets.priceRanges.length > 0
      ? [{ id: "price" as const, label: "Cena", icon: Tag }]
      : []),
    { id: "all", label: "Filtry", icon: Funnel },
  ];

  return (
    <div className="border-t border-border bg-background">
      <nav
        className="mx-auto flex w-[90vw] max-w-[1440px] items-center gap-1 py-1.5"
        aria-label="Filtry listingu"
      >
        {buttons.map((button) => {
          const isAll = button.id === "all";
          const active = isAll ? allFiltersOpen : openPanel === button.id;
          const panelId = button.id;

          return (
            <MobileFilterBarButton
              key={button.id}
              label={button.label}
              icon={button.icon}
              active={active}
              expanded={active}
              onClick={() => {
                if (panelId === "all") {
                  onOpenAllFilters();
                } else {
                  onTogglePanel(panelId);
                }
              }}
            />
          );
        })}
      </nav>
    </div>
  );
}
