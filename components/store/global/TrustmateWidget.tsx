"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export const TRUSTMATE_COMPACT_WIDGET_ID = "ff7e17fd-609a-431f-bec8-6c57a2976b87";
export const TRUSTMATE_REVIEWS_WIDGET_ID =
  "ccd80311-43a6-4edb-838c-c4c239a05c67";

function getTrustmateScriptUrl(widgetId: string) {
  return `https://trustmate.pro/widget/api/${widgetId}/script`;
}

function loadTrustmateScript(widgetId: string) {
  const scriptUrl = getTrustmateScriptUrl(widgetId);
  const existing = document.querySelector(`script[src="${scriptUrl}"]`);

  // Skrypt Trustmate szuka tagu w DOM w momencie wykonania.
  // Po nawigacji SPA lub opóźnionym renderze trzeba go załadować ponownie,
  // gdy kontener już istnieje — tylko dla tego samego widgetu.
  if (existing) {
    existing.remove();
  }

  const script = document.createElement("script");
  script.src = scriptUrl;
  script.defer = true;
  document.body.appendChild(script);
}

export default function TrustmateWidget({
  className,
  widgetId = TRUSTMATE_COMPACT_WIDGET_ID,
}: {
  className?: string;
  widgetId?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    loadTrustmateScript(widgetId);
  }, [widgetId]);

  return (
    <div className={cn(className)}>
      <div ref={containerRef} id={widgetId} />
    </div>
  );
}
