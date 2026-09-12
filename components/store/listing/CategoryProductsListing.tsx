"use client";

import { Suspense } from "react";
import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import ListingPagination from "./ListingPagination";
import {
  ListingFiltersProvider,
  useListingFilters,
} from "./filters/ListingFiltersContext";
import MobileFiltersBar from "./filters/mobile/MobileFiltersBar";
import MobileCategoryPathBar from "./filters/mobile/MobileCategoryPathBar";
import DesktopFiltersBar from "./filters/DesktopFiltersBar";
import SelectedFiltersSticky from "./filters/SelectedFiltersSticky";
import ProductGrid from "./ProductGrid";
import { PRODUCTS_PER_PAGE } from "@/helpers/listingFilters/types";
import { groupVariantsByProductId } from "@/helpers/listingVariants";

function CategoryProductsListingInner() {
  const { filteredProducts, pageProducts, page, variantsByProductId } =
    useListingFilters();

  return (
    <>
      <DesktopFiltersBar />
      <MobileCategoryPathBar />
      <SelectedFiltersSticky />

      {filteredProducts.length > 0 ? (
        <ProductGrid
          products={pageProducts}
          priorityCount={page === 1 ? 6 : 0}
          variantsByProductId={variantsByProductId}
        />
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
    <Suspense
      fallback={
        <ProductGrid
          products={products.slice(0, PRODUCTS_PER_PAGE)}
          priorityCount={6}
          variantsByProductId={groupVariantsByProductId(products)}
        />
      }
    >
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
