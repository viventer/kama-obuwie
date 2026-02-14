"use client";

import { useEffect, useState } from "react";
import ProductSeriesRootCategorySelector from "./ProductSeriesRootCategorySelector";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import Image from "next/image";

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
  const [filteredCategories, setFilteredCategories] = useState(categories);

  useEffect(() => {
    const newFilteredCategories = categories.filter(
      (category) => category.rootCategory === selectedRootCategory,
    );
    setFilteredCategories(newFilteredCategories);
  }, [selectedRootCategory]);

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-xl md:text-2xl font-medium pb-2">Czego szukasz?</h2>
      <ProductSeriesRootCategorySelector
        selectedRootCategory={selectedRootCategory}
        setSelectedRootCategory={setSelectedRootCategory}
      />
      <div className="overflow-x-auto scrollbar">
        <div className="grid grid-rows-2 grid-flow-col gap-2 pb-2 w-fit">
          {filteredCategories.map((category) => (
            <div
              key={category.id}
              className="bg-card p-4 w-[48vw] xs:w-[40vw] max-w-[250px] rounded-xs"
            >
              <Image
                src={category.thumbnailUrl}
                alt={category.name}
                width={400}
                height={400}
                className="p-2 w-full rounded-xs bg-white mb-4"
              />
              <h3 className="text-center font-medium sm:text-lg md:text-xl capitalize">
                {category.name}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
