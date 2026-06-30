"use client";

import { useLayoutEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const TRUSTMATE_COMPACT_WIDGET_ID =
  "ff7e17fd-609a-431f-bec8-6c57a2976b87";
export const TRUSTMATE_REVIEWS_WIDGET_ID =
  "ccd80311-43a6-4edb-838c-c4c239a05c67";

const widgetStashes = new Map<string, HTMLDivElement>();

function getTrustmateScriptUrl(widgetId: string) {
  return `https://trustmate.pro/widget/api/${widgetId}/script`;
}

function getWidgetStash(widgetId: string) {
  let stash = widgetStashes.get(widgetId);

  if (!stash) {
    stash = document.createElement("div");
    stash.hidden = true;
    stash.setAttribute("aria-hidden", "true");
    document.body.appendChild(stash);
    widgetStashes.set(widgetId, stash);
  }

  return stash;
}

function ensureTrustmateScript(widgetId: string, host: HTMLElement) {
  if (host.innerHTML.trim()) {
    return;
  }

  const scriptUrl = getTrustmateScriptUrl(widgetId);

  if (document.querySelector(`script[src="${scriptUrl}"]`)) {
    return;
  }

  const script = document.createElement("script");
  script.src = scriptUrl;
  script.defer = true;
  document.body.appendChild(script);
}

function acquireWidgetHost(widgetId: string, mount: HTMLElement) {
  const stash = getWidgetStash(widgetId);
  let host = document.getElementById(widgetId);

  if (!host) {
    host = document.createElement("div");
    host.id = widgetId;
  }

  if (host.parentElement !== mount) {
    mount.appendChild(host);
  }

  if (!host.innerHTML.trim()) {
    ensureTrustmateScript(widgetId, host);
  }

  return () => {
    if (host.isConnected && host.parentElement !== stash) {
      stash.appendChild(host);
    }
  };
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
  const mountRef = useRef<HTMLDivElement>(null);
  const showReviewsButton = widgetId === TRUSTMATE_COMPACT_WIDGET_ID;

  useLayoutEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    return acquireWidgetHost(widgetId, mount);
  }, [widgetId]);

  const openReviews = () => {
    mountRef.current
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
        ref={mountRef}
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
