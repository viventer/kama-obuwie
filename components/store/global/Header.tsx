"use client";

import Image from "next/image";
import HeaderBanner from "./HeaderBanner";
import ShoppingCartButton from "../shopping-cart/ShoppingCartButton";
import IconButton from "@/components/adminPanel/global/IconButton";
import { SearchIcon } from "lucide-react";
import { useStoreSearch } from "../search/StoreSearchContext";
import StoreSearchInput from "../search/StoreSearchInput";

export default function Header() {
  const {
    isOpen,
    openSearch,
    closeSearch,
    query,
    setQuery,
    buildResultsHref,
  } = useStoreSearch();

  return (
    <header className="sm:flex sm:justify-center bg-card" data-store-header>
      <div className="flex flex-col sm:flex-row items-center gap-x-8 w-full sm:w-[90%] sm:max-w-[1440px] relative">
        <div className="w-full sm:w-auto">
          <HeaderBanner />
        </div>

        <section className="w-[90%] my-2 flex items-center gap-2 sm:order-first sm:w-fit justify-between">
          <a className="flex items-center gap-2" href="/">
            <Image
              src="/branding/logo.svg"
              alt="Logo"
              width={64}
              height={64}
              className="size-8"
            />
            <h1 className="text-lg font-bold">KAMA</h1>
          </a>
          <div className="flex items-center gap-2 sm:hidden">
            <IconButton onClick={openSearch} title="Szukaj" className="p-1">
              <SearchIcon className="size-6" />
            </IconButton>
            <ShoppingCartButton />
          </div>
        </section>

        <div className="hidden sm:flex items-center justify-end flex-1 gap-8">
          <div className="w-full max-w-xl" data-store-search-input>
            <StoreSearchInput
              value={query}
              onChange={(value) => {
                setQuery(value);
                if (!isOpen) openSearch();
              }}
              onFocus={openSearch}
              buildHref={(q) => buildResultsHref(q)}
              onSubmitNavigate={() =>
                closeSearch({ resetQueryToUrl: false })
              }
            />
          </div>
          <ShoppingCartButton />
        </div>
      </div>
    </header>
  );
}
