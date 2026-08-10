"use client";

import IconButton from "@/components/adminPanel/global/IconButton";
import { ChevronLeft } from "lucide-react";
import { useStoreSearch } from "./StoreSearchContext";
import StoreSearchInput from "./StoreSearchInput";
import SearchResultsPanel from "./SearchResultsPanel";

/**
 * Self-contained fullscreen search for mobile. Does not depend on the sticky
 * header position or browser chrome measurements.
 */
export default function MobileSearchScreen() {
  const {
    isOpen,
    closeSearch,
    query,
    setQuery,
    buildResultsHref,
  } = useStoreSearch();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex flex-col bg-background sm:hidden pt-[env(safe-area-inset-top)]">
      <div className="flex shrink-0 items-center gap-2 border-b border-border px-[5%] py-2">
        <IconButton
          onClick={() => closeSearch()}
          title="Wróć"
          className="shrink-0 p-1"
        >
          <ChevronLeft className="size-6" />
        </IconButton>
        <div className="min-w-0 flex-1">
          <StoreSearchInput
            value={query}
            onChange={setQuery}
            autoFocus
            buildHref={(q) => buildResultsHref(q)}
            onSubmitNavigate={() => closeSearch({ resetQueryToUrl: false })}
          />
        </div>
      </div>
      <div className="min-h-0 flex-1">
        <SearchResultsPanel />
      </div>
    </div>
  );
}
