"use client";

import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";
import { useEffect, useState } from "react";
import ListingFilters from "./ListingFilters";
import { getPriceRangesForFiltering, PriceRange } from "@/helpers/prices";

export default function CategoryProductsListing({
  productsFromCategory,
}: {
  productsFromCategory: ProductListingData[];
}) {
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availablePriceRanges, setAvailablePriceRanges] = useState<
    PriceRange[]
  >([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPriceRange, setSelectedPriceRange] = useState<PriceRange[]>(
    []
  );
  const [filteredProducts, setFilteredProducts] =
    useState<ProductListingData[]>(productsFromCategory);

  useEffect(() => {
    const sizesSet = new Set<string>();
    productsFromCategory.forEach((product) => {
      Object.keys(product.availability).forEach((size) => {
        sizesSet.add(size);
      });
    });
    setAvailableSizes(
      Array.from(sizesSet).sort((a, b) => Number(a) - Number(b))
    );

    const pricesSet = new Set<number>();
    productsFromCategory.forEach((product) => {
      if (product.price !== undefined && product.price !== null) {
        pricesSet.add(Number(product.price));
      }
    });

    const priceRanges: PriceRange[] | null = getPriceRangesForFiltering(
      Array.from(pricesSet)
    );

    if (priceRanges !== null) {
      setAvailablePriceRanges(priceRanges);
    }
  }, [productsFromCategory]);

  useEffect(() => {
    let filtered = productsFromCategory;

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.some((size) => product.availability[size])
      );
    }

    if (selectedPriceRange.length > 0) {
      filtered = filtered.filter((product) => {
        const price = Number(product.price);
        return selectedPriceRange.some(
          (range) => price >= range.from && price <= range.to
        );
      });
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
        <section className="grid gap-6 2xs:grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))]">
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
