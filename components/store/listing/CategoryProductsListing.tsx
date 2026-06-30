"use client";

import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";
import { useEffect, useMemo, useState } from "react";
import ListingFilters from "./ListingFilters";
import {
  getPriceRangesForFiltering,
  isProductPriceInRange,
  PriceRange,
} from "@/helpers/prices";
import { getAllListingSizes, hasSelectedSizes } from "@/helpers/sizes";

export default function CategoryProductsListing({
  productsFromCategory,
}: {
  productsFromCategory: ProductListingData[];
}) {
  const availableSizes = useMemo(
    () => getAllListingSizes(productsFromCategory),
    [productsFromCategory],
  );

  const availablePriceRanges = useMemo(() => {
    const pricesSet = new Set<number>();
    productsFromCategory.forEach((product) => {
      if (product.price !== undefined && product.price !== null) {
        pricesSet.add(Number(product.price));
      }
    });

    return getPriceRangesForFiltering(Array.from(pricesSet)) ?? [];
  }, [productsFromCategory]);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange[]>(
    [],
  );
  const [filteredProducts, setFilteredProducts] =
    useState<ProductListingData[]>(productsFromCategory);

  useEffect(() => {
    let filtered = productsFromCategory;

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        hasSelectedSizes(selectedSizes, product.availability),
      );
    }

    if (selectedPriceRange.length > 0) {
      filtered = filtered.filter((product) =>
        isProductPriceInRange(product, selectedPriceRange),
      );
    }

    setFilteredProducts(filtered);
  }, [selectedSizes, selectedPriceRange, productsFromCategory]);

  return (
    <>
      <ListingFilters
        selectedSizes={selectedSizes}
        availableSizes={availableSizes}
        sizesOnChange={setSelectedSizes}
        selectedPriceRange={selectedPriceRange}
        pricesOnChange={setSelectedPriceRange}
        availablePriceRanges={availablePriceRanges}
      />

      {filteredProducts && filteredProducts.length > 0 ? (
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
    </>
  );
}
