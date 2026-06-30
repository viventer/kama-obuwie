"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TRUSTMATE_COMPACT_WIDGET_ID =
  "ff7e17fd-609a-431f-bec8-6c57a2976b87";
export const TRUSTMATE_REVIEWS_WIDGET_ID =
  "ccd80311-43a6-4edb-838c-c4c239a05c67";

function getTrustmateScriptUrl(widgetId: string) {
  return `https://trustmate.pro/widget/api/${widgetId}/script`;
}

function loadTrustmateScript(widgetId: string) {
  const scriptUrl = getTrustmateScriptUrl(widgetId);
  const existing = document.querySelector(`script[src="${scriptUrl}"]`);

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
  alignActionEnd = false,
}: {
  className?: string;
  widgetId?: string;
  alignActionEnd?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const showReviewsButton = widgetId === TRUSTMATE_COMPACT_WIDGET_ID;

  useEffect(() => {
    if (!containerRef.current) return;
    loadTrustmateScript(widgetId);
  }, [widgetId]);

  const openReviews = () => {
    containerRef.current
      ?.querySelector<HTMLElement>(".tm-dialog-open")
      ?.click();
  };

  return (
    <div
      className={cn(
        showReviewsButton &&
          "flex flex-col gap-3 px-4 py-4 lg:flex-row lg:items-center lg:justify-between lg:gap-4 lg:px-6 lg:py-6",
        className,
      )}
    >
      <div
        ref={containerRef}
        id={widgetId}
        className={cn(showReviewsButton && "min-w-0 flex-1")}
      />
      {showReviewsButton ? (
        <Button
          type="button"
          variant="outline"
          onClick={openReviews}
          className={cn("shrink-0", alignActionEnd && "self-end")}
        >
          Zobacz opinie
        </Button>
      ) : null}
    </div>
  );
}
