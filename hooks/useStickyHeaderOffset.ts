"use client";

import { useEffect, useState } from "react";

/**
 * Returns the bottom edge (in px) of the sticky header/nav bar,
 * so child sticky elements can sit directly underneath it.
 */
export function useStickyHeaderOffset(): number {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const barEl = document.querySelector(
      "[data-main-nav-bar]",
    ) as HTMLElement | null;

    if (!barEl) {
      return;
    }

    const update = () => {
      setOffset(
        Math.max(0, Math.round(barEl.getBoundingClientRect().bottom)),
      );
    };

    update();

    const resizeObserver = new ResizeObserver(() => update());
    resizeObserver.observe(barEl);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, []);

  return offset;
}
