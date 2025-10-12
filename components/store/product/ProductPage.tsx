"use client";

import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import ProductImagesSlider from "./ProductImagesSlider";
import SelectProductVariant from "./SelectProductVariant";
import { useState } from "react";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { notFound, useRouter, useSearchParams } from "next/navigation";

export default function ProductPage({
  imagesUrls,
  productData,
  category,
  initialColorVariantName,
}: {
  imagesUrls: Record<string, string[]>;
  productData: ProductWithId;
  category: CategoryWithId;
  initialColorVariantName?: string;
}) {
  if (!productData.colorVariants) {
    notFound();
  }

  // Sprawdź czy initialColorVariantName jest prawidłowy
  const validInitialVariant =
    initialColorVariantName &&
    productData.colorVariants.some(
      (variant) => getColorVariantName(variant) === initialColorVariantName
    )
      ? initialColorVariantName
      : getColorVariantName(productData.colorVariants[0]);

  const [selectedColorVariant, setSelectedColorVariant] =
    useState(validInitialVariant);

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVariantChange = (newVariant: string) => {
    setSelectedColorVariant(newVariant);

    // Aktualizuj URL
    const params = new URLSearchParams(searchParams);
    params.set("colorVariantName", newVariant);
    router.replace(`/product/${productData.id}?${params.toString()}`, {
      scroll: false,
    });
  };

  return (
    <div className="flex gap-8">
      <ProductImagesSlider imagesUrls={imagesUrls[selectedColorVariant]} />
      <div className="w-full flex flex-col gap-6">
        <article className="bg-primary/50 rounded-sm px-4 py-2">
          <h2 className="capitalize font-bold text-2xl ">{category.name}</h2>
          <p className="text-lg">
            {productData?.brand}{" "}
            <span className="font-thin">{productData.manufacturerCode}</span>
          </p>
        </article>
        <SelectProductVariant
          colorVariants={productData.colorVariants}
          imagesUrls={imagesUrls}
          selectedColorVariant={selectedColorVariant}
          onVariantChange={handleVariantChange}
        />
      </div>
    </div>
  );
}
