"use client";

import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductFromList from "../home/ProductFromList";
import { useEffect, useState } from "react";
import ListingFilters from "./ListingFilters";

export type PriceRange = {
  from: number;
  to: number;
};

export default function CategoryProductsListing({
  productsFromCategory,
}: {
  productsFromCategory: ProductListingData[];
}) {
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<PriceRange[]>([]);
  const [filteredProducts, setFilteredProducts] =
    useState<ProductListingData[]>(productsFromCategory);

  useEffect(() => {
    const sizesSet = new Set<string>();
    productsFromCategory.forEach((product) => {
      Object.keys(product.availability).forEach((size) => {
        sizesSet.add(size);
      });
    });
    setAvailableSizes(Array.from(sizesSet));
  }, [productsFromCategory]);

  useEffect(() => {
    let filtered = productsFromCategory;

    if (selectedSizes.length > 0) {
      filtered = filtered.filter((product) =>
        selectedSizes.some((size) => product.availability[size])
      );
    }

    setFilteredProducts(filtered);
  }, [selectedSizes, selectedPrices]);

  return (
    <>
      <ListingFilters
        selectedSizes={selectedSizes}
        availableSizes={availableSizes}
        sizesOnChange={setSelectedSizes}
        selectedPrices={selectedPrices}
        pricesOnChange={setSelectedPrices}
      />
      <section className="grid gap-6 2xs:grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))]">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductFromList
              key={`${product.id}-${product.colorVariantName}`}
              product={product}
            />
          ))
        ) : (
          <div className="text-lg">Brak dostępnych produktów</div>
        )}
      </section>
    </>
  );
}
