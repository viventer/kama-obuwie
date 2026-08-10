"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useStoreSearch } from "./StoreSearchContext";

/** Prevent background page scroll while the mobile search screen is open. */
export default function StoreShell({ children }: { children: ReactNode }) {
  const { isOpen } = useStoreSearch();

  return (
    <div
      className={cn(
        "flex min-h-screen flex-col",
        isOpen && "max-sm:overflow-hidden",
      )}
    >
      {children}
    </div>
  );
}
