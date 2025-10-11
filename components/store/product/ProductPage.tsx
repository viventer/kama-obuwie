"use client";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import ProductImagesSlider from "./ProductImagesSlider";
import { useState } from "react";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { notFound } from "next/navigation";

export default function ProductPage({
  imagesUrls,
  productData,
}: {
  imagesUrls: Record<string, string[]>;
  productData: ProductWithId;
}) {
  if (!productData.colorVariants) {
    notFound();
  }

  const [selectedColorVariant, setSelectedColorVariant] = useState(
    getColorVariantName(productData.colorVariants[0])
  );

  return (
    <>
      <ProductImagesSlider imagesUrls={imagesUrls[selectedColorVariant]} />
    </>
  );
}
