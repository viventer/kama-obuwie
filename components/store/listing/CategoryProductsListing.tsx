"use client";

import {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";
import {
  ListingFiltersProvider,
  useListingFilters,
} from "./filters/ListingFiltersContext";
import MobileFiltersBar from "./filters/mobile/MobileFiltersBar";
import DesktopFiltersBar from "./filters/DesktopFiltersBar";
import SelectedFiltersSticky from "./filters/SelectedFiltersSticky";

function CategoryProductsListingInner() {
  const { filteredProducts } = useListingFilters();

  return (
    <>
      <DesktopFiltersBar />
      <SelectedFiltersSticky />

      {filteredProducts.length > 0 ? (
        <section className="grid gap-x-2 gap-y-8 md:gap-8 grid-cols-[repeat(auto-fill,_minmax(9rem,_1fr))] md:grid-cols-[repeat(auto-fill,_minmax(16rem,_1fr))]">
          {filteredProducts.map((product) => (
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

      <MobileFiltersBar />
    </>
  );
}

export default function CategoryProductsListing({
  productsFromCategory,
  rootCategory,
}: {
  productsFromCategory: ProductListingData[];
  rootCategory: RootCategory;
}) {
  return (
    <ListingFiltersProvider
      products={productsFromCategory}
      rootCategory={rootCategory}
    >
      <CategoryProductsListingInner />
    </ListingFiltersProvider>
  );
}
