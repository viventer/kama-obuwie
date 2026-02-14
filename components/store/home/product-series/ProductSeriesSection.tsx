"use client";

import { useState } from "react";
import ProductSeriesRootCategorySelector from "./ProductSeriesRootCategorySelector";
import { RootCategory } from "@/firebase/schemas/productsSchemas";

export type ProductSeriesCategory = {
  name: string;
  rootCategory: RootCategory;
  id: string;
  thumbnailUrl: string;
};

export default function ProductSeriesSection({
  categories,
}: {
  categories: ProductSeriesCategory[];
}) {
  const [selectedRootCategory, setSelectedRootCategory] =
    useState<RootCategory>("obuwie męskie");

  return (
    <section>
      <h2 className="text-xl font-medium mb-2">Czego szukasz?</h2>
      <ProductSeriesRootCategorySelector
        selectedRootCategory={selectedRootCategory}
        setSelectedRootCategory={setSelectedRootCategory}
      />
    </section>
  );
}
