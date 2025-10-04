"use client";

import { useState, useEffect } from "react";

const breakpoints = {
  xs: 0,
  sm: 460,
  md: 830,
  lg: 1024,
  xl: 1280,
} as const;

export type Breakpoint = keyof typeof breakpoints;

function getBreakpointFromWidth(width: number): Breakpoint {
  if (width >= breakpoints.xl) return "xl";
  if (width >= breakpoints.lg) return "lg";
  if (width >= breakpoints.md) return "md";
  if (width >= breakpoints.sm) return "sm";
  return "xs";
}

export function useBreakpoint() {
  const [currentBreakpoint, setCurrentBreakpoint] = useState<Breakpoint | null>(
    null
  );

  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth;
      const newBreakpoint = getBreakpointFromWidth(width);
      setCurrentBreakpoint(newBreakpoint);
    };

    // Set initial value
    updateBreakpoint();

    // Add event listener
    window.addEventListener("resize", updateBreakpoint);

    // Cleanup
    return () => window.removeEventListener("resize", updateBreakpoint);
  }, []);

  const isAtLeast = (breakpoint: Breakpoint) => {
    const currentWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    return currentWidth >= breakpoints[breakpoint];
  };

  const isBelow = (breakpoint: Breakpoint) => {
    const currentWidth = typeof window !== "undefined" ? window.innerWidth : 0;
    return currentWidth < breakpoints[breakpoint];
  };

  return {
    currentBreakpoint: currentBreakpoint || "xl", // fallback do xl jeśli null
    isAtLeast,
    isBelow,
    breakpoints,
  };
}
