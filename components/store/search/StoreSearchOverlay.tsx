"use client";

import { useLayoutEffect, useState } from "react";
import { useStoreSearch } from "./StoreSearchContext";
import SearchResultsPanel from "./SearchResultsPanel";
import MobileSearchScreen from "./MobileSearchScreen";

type PanelBox = {
  top: number;
  left: number;
  width: number;
};

/** Desktop popover anchored to the search input. Mobile uses MobileSearchScreen. */
export default function StoreSearchOverlay() {
  const { isOpen, closeSearch } = useStoreSearch();
  const [panelBox, setPanelBox] = useState<PanelBox | null>(null);
  const [dimmerTop, setDimmerTop] = useState(0);

  useLayoutEffect(() => {
    if (!isOpen) return;

    const update = () => {
      const isDesktop = window.matchMedia("(min-width: 640px)").matches;
      if (!isDesktop) {
        setPanelBox(null);
        return;
      }

      const inputEl = document.querySelector(
        "[data-store-search-input]",
      ) as HTMLElement | null;
      const headerEl = document.querySelector(
        "[data-store-header]",
      ) as HTMLElement | null;
      if (!inputEl) return;

      const rect = inputEl.getBoundingClientRect();
      setPanelBox({
        top: Math.max(0, Math.round(rect.bottom) + 12),
        left: Math.round(rect.left),
        width: Math.round(rect.width),
      });
      setDimmerTop(
        Math.max(
          0,
          Math.round(
            (headerEl ?? inputEl).getBoundingClientRect().bottom,
          ),
        ),
      );
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      <MobileSearchScreen />

      {panelBox && (
        <>
          <div
            style={{ top: dimmerTop }}
            className="fixed inset-x-0 bottom-0 z-[110] hidden bg-black/20 backdrop-blur-xs sm:block"
            onClick={() => closeSearch()}
            aria-hidden
          />
          <div
            style={{
              top: panelBox.top,
              left: panelBox.left,
              width: panelBox.width,
            }}
            className="fixed z-[120] hidden max-h-[min(70vh,32rem)] flex-col overflow-hidden rounded-md border border-border bg-background shadow-lg sm:flex"
          >
            <SearchResultsPanel />
          </div>
        </>
      )}
    </>
  );
}
