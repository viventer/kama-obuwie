"use client";

import { useEffect, useRef, useState } from "react";
import MobileAllFiltersSheet from "./MobileAllFiltersSheet";
import MobileFilterBarNav from "./MobileFilterBarNav";
import MobileFilterBarPanel, {
  type MobileFilterPanel,
} from "./MobileFilterBarPanel";

export default function MobileFiltersBar() {
  const [openPanel, setOpenPanel] = useState<MobileFilterPanel | null>(null);
  const [allFiltersOpen, setAllFiltersOpen] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  const togglePanel = (panel: MobileFilterPanel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  };

  useEffect(() => {
    if (!openPanel) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };

    const onPointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (barRef.current && !barRef.current.contains(target)) {
        setOpenPanel(null);
      }
    };

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
    };
  }, [openPanel]);

  return (
    <>
      {openPanel && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          aria-hidden
          onClick={() => setOpenPanel(null)}
        />
      )}

      {/*
        z-50 < header z-100: when the bar scrolls up into the footer area
        it passes under the sticky header instead of covering it.
        Panel is absolute bottom-full so expanding never changes bar height.
      */}
      <div
        ref={barRef}
        className="sticky bottom-0 z-50 mt-16 w-screen max-w-[100vw] ml-[calc(50%-50vw)] md:hidden"
      >
        <div className="relative">
          {openPanel && (
            <MobileFilterBarPanel
              panel={openPanel}
              onClose={() => setOpenPanel(null)}
            />
          )}

          <MobileFilterBarNav
            openPanel={openPanel}
            allFiltersOpen={allFiltersOpen}
            onTogglePanel={togglePanel}
            onOpenAllFilters={() => {
              setOpenPanel(null);
              setAllFiltersOpen(true);
            }}
          />
        </div>
      </div>

      <MobileAllFiltersSheet
        open={allFiltersOpen}
        onOpenChange={setAllFiltersOpen}
      />
    </>
  );
}
