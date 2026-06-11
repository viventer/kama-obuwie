"use client";

import { cn } from "@/lib/utils";
import { OPEN_COOKIE_SETTINGS_EVENT } from "@/lib/consent";

export default function CookieSettingsTrigger({
  className,
}: {
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() =>
        window.dispatchEvent(new Event(OPEN_COOKIE_SETTINGS_EVENT))
      }
      className={cn(
        "decoration-1 decoration-brand underline underline-offset-3 hover:decoration-accent/0 transition-all duration-150 font-normal text-text text-left hover:cursor-pointer",
        className,
      )}
    >
      Ustawienia cookies
    </button>
  );
}
