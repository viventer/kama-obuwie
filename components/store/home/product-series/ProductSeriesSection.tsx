"use client";

import { useEffect, useState } from "react";
import ProductSeriesRootCategorySelector from "./ProductSeriesRootCategorySelector";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import ProductSeriesCategoriesList from "./ProductSeriesCategoriesList";
import BestsellersSection from "./BestsellersSection";
import type { Bestsellers, BestsellersRootCategory } from "@/lib/bestsellers";

export type ProductSeriesCategory = {
  name: string;
  rootCategory: BestsellersRootCategory;
  id: string;
  thumbnailUrl: string;
};

export default function ProductSeriesSection({
  categories,
  bestsellersData,
}: {
  categories: ProductSeriesCategory[];
  bestsellersData: Bestsellers;
}) {
  const [selectedRootCategory, setSelectedRootCategory] =
    useState<BestsellersRootCategory>("obuwie męskie");
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    const newFilteredCategories = categories.filter(
      (category) => category.rootCategory === selectedRootCategory,
    );
    setFilteredCategories(newFilteredCategories);
  }, [selectedRootCategory]);

  return (
    <section className="flex flex-col gap-14">
      <div className="flex flex-col gap-2">
        <h2 className="text-xl md:text-2xl font-medium pb-2">
          Znajdź idealną parę
        </h2>
        <ProductSeriesRootCategorySelector
          selectedRootCategory={selectedRootCategory}
          setSelectedRootCategory={setSelectedRootCategory}
        />
        <ProductSeriesCategoriesList filteredCategories={filteredCategories} />
      </div>
      <BestsellersSection
        bestsellersData={bestsellersData}
        rootCategory={selectedRootCategory}
      />
    </section>
  );
}
