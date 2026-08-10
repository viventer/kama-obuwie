"use client";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { SearchIcon, X } from "lucide-react";
import { FormEvent, useRef } from "react";
import { useRouter } from "next/navigation";
import { SEARCH_MIN_QUERY_LENGTH } from "@/lib/search/constants";

export default function StoreSearchInput({
  value,
  onChange,
  onFocus,
  onClear,
  onSubmitNavigate,
  autoFocus = false,
  className,
  inputClassName,
  placeholder = "Szukaj produktów…",
  buildHref,
}: {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onClear?: () => void;
  /** Called after client-side navigation to results. */
  onSubmitNavigate?: () => void;
  autoFocus?: boolean;
  className?: string;
  inputClassName?: string;
  placeholder?: string;
  /** Build results URL from the current input value (avoids stale form state). */
  buildHref: (query: string) => string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = value.trim();
    if (trimmed.length < SEARCH_MIN_QUERY_LENGTH) return;
    // Explicit client navigation — never rely on native GET form, which can
    // race with the previous /listing?q=... page URL / Next soft-nav.
    router.push(buildHref(trimmed));
    onSubmitNavigate?.();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "relative flex items-center w-full bg-foreground/10 rounded-md border border-transparent focus-within:border-primary",
        className,
      )}
    >
      <SearchIcon
        className="size-4 ml-3 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <Input
        ref={inputRef}
        // text + enterKeyHint: keep mobile "search" key without the native
        // WebKit clear (×) that stacks next to our custom clear button.
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        autoFocus={autoFocus}
        placeholder={placeholder}
        autoComplete="off"
        enterKeyHint="search"
        className={cn(
          "border-none shadow-none focus-visible:ring-0 bg-transparent max-w-none flex-1 min-w-0",
          inputClassName,
        )}
      />
      {value.length > 0 && (
        <button
          type="button"
          onClick={() => {
            onChange("");
            onClear?.();
            inputRef.current?.focus();
          }}
          className="shrink-0 p-2 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="Wyczyść"
        >
          <X className="size-4" />
        </button>
      )}
    </form>
  );
}
