"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

const TRUSTMATE_WIDGET_ID = "ff7e17fd-609a-431f-bec8-6c57a2976b87";
const TRUSTMATE_SCRIPT_URL = `https://trustmate.pro/widget/api/${TRUSTMATE_WIDGET_ID}/script`;

function loadTrustmateScript() {
  const existing = document.querySelector(
    `script[src="${TRUSTMATE_SCRIPT_URL}"]`,
  );

  // Skrypt Trustmate szuka tagu w DOM w momencie wykonania.
  // Po nawigacji SPA lub opóźnionym renderze (np. loader w koszyku)
  // trzeba go załadować ponownie, gdy kontener już istnieje.
  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");
  script.src = TRUSTMATE_SCRIPT_URL;
  script.defer = true;
  document.body.appendChild(script);
}

export default function TrustmateWidget({ className }: { className?: string }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    loadTrustmateScript();
  }, []);

  return (
    <div className={cn(className)}>
      <div ref={containerRef} id={TRUSTMATE_WIDGET_ID} />
    </div>
  );
}
