"use client";

import { type ReactNode } from "react";

/** Main navigation strip under the header. */
export default function MainNavBar({ children }: { children: ReactNode }) {
  return (
    <div
      data-main-nav-bar
      className="border-b-1 py-2 flex justify-center sm:px-[5%] bg-background"
    >
      {children}
    </div>
  );
}
