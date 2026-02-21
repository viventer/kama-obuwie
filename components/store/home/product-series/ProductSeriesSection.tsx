"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import ProductSeriesRootCategorySelector from "./ProductSeriesRootCategorySelector";
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

  const filteredCategories = useMemo(() => {
    return categories.filter(
      (category) => category.rootCategory === selectedRootCategory,
    );
  }, [categories, selectedRootCategory]);

  const variants = {
    hidden: { opacity: 0, x: -24 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 24 },
  };

  const transition = { duration: 0.35, ease: cubicBezier(0.22, 1, 0.36, 1) };

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

        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`categories-${selectedRootCategory}`}
            variants={variants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
            className="overflow-hidden will-change-[transform,opacity]"
          >
            <ProductSeriesCategoriesList
              filteredCategories={filteredCategories}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={`bestsellers-${selectedRootCategory}`}
          variants={variants}
          initial="hidden"
          animate="visible"
          exit="exit"
          transition={transition}
          className="overflow-hidden will-change-[transform,opacity]"
        >
          <BestsellersSection
            bestsellersData={bestsellersData}
            rootCategory={selectedRootCategory}
          />
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
