"use client";

import { Suspense } from "react";
import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";
import ListingPagination from "./ListingPagination";
import {
  ListingFiltersProvider,
  useListingFilters,
} from "./filters/ListingFiltersContext";
import MobileFiltersBar from "./filters/mobile/MobileFiltersBar";
import MobileCategoryPathBar from "./filters/mobile/MobileCategoryPathBar";
import DesktopFiltersBar from "./filters/DesktopFiltersBar";
import SelectedFiltersSticky from "./filters/SelectedFiltersSticky";

function CategoryProductsListingInner() {
  const { filteredProducts, pageProducts } = useListingFilters();

  return (
    <>
      <DesktopFiltersBar />
      <MobileCategoryPathBar />
      <SelectedFiltersSticky />

      {filteredProducts.length > 0 ? (
        <section className="grid gap-x-2 gap-y-8 md:gap-8 grid-cols-[repeat(auto-fill,_minmax(9rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))]">
          {pageProducts.map((product) => (
            <ProductFromList
              key={`${product.id}-${product.colorVariantName}`}
              product={product}
            />
          ))}
        </section>
      ) : (
        <div className="text-lg">
          Nie znaleziono produktów spełniających podane kryteria.
        </div>
      )}

      <ListingPagination />
      <MobileFiltersBar />
    </>
  );
}

export default function CategoryProductsListing({
  products,
  rootCategory,
  enableCategoryFilter = false,
  categoryLabels = {},
  defaultSortLabel,
}: {
  products: ProductListingData[];
  rootCategory?: RootCategory;
  enableCategoryFilter?: boolean;
  categoryLabels?: Record<string, string>;
  defaultSortLabel?: string;
}) {
  return (
    <Suspense fallback={null}>
      <ListingFiltersProvider
        products={products}
        rootCategory={rootCategory}
        enableCategoryFilter={enableCategoryFilter}
        categoryLabels={categoryLabels}
        defaultSortLabel={defaultSortLabel}
      >
        <CategoryProductsListingInner />
      </ListingFiltersProvider>
    </Suspense>
  );
}
