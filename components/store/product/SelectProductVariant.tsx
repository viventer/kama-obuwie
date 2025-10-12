"use client";

import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import Image from "next/image";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SelectProductVariantProps {
  colorVariants: ColorVariant[];
  imagesUrls: Record<string, string[]>;
  selectedColorVariant: string;
  onVariantChange: (variant: string) => void;
}

export default function SelectProductVariant({
  colorVariants,
  imagesUrls,
  selectedColorVariant,
  onVariantChange,
}: SelectProductVariantProps) {
  if (colorVariants.length <= 1) {
    return null;
  }

  return (
    <article>
      <h3 className="text-xl font-medium mb-2">Wybierz kolor</h3>
      <Tabs
        value={selectedColorVariant}
        onValueChange={onVariantChange}
        className="w-full"
      >
        <TabsList className="flex gap-4 h-auto bg-transparent mb-2">
          {colorVariants.map((colorVariant) => {
            const variantName = getColorVariantName(colorVariant);
            const isSelected = selectedColorVariant === variantName;
            const imageUrl = imagesUrls[variantName]?.[0];

            return (
              <TabsTrigger
                key={variantName}
                value={variantName}
                className="p-0 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 hover:bg-transparent"
              >
                <div className="relative">
                  <Image
                    src={imageUrl}
                    alt={`Wariant ${variantName}`}
                    width={120}
                    height={120}
                    className={`object-contain aspect-square bg-white rounded-xl transition-all duration-200 ${
                      isSelected
                        ? "ring-4 ring-brand opacity-100"
                        : "opacity-75 hover:opacity-90"
                    }`}
                  />
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-brand rounded-full"></div>
                  )}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
        {colorVariants.map((colorVariant) => {
          const variantName = getColorVariantName(colorVariant);
          return (
            <TabsContent key={variantName} value={variantName}>
              <div className="text-sm text-muted-foreground">
                Wybrano{" "}
                <span className="font-medium text-text">{variantName} </span>
                kolor
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </article>
  );
}
