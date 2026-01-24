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
      <h3 className="text-lg font-medium md:text-xl">Kolor</h3>
      <Tabs
        value={selectedColorVariant}
        onValueChange={onVariantChange}
        className="w-full gap-0"
      >
        <TabsList
          className="h-auto bg-transparent mb-2 grid gap-4
    grid-cols-[repeat(auto-fit,minmax(70px,max-content))]  justify-start w-full"
        >
          {colorVariants.map((colorVariant) => {
            const variantName = getColorVariantName(colorVariant);
            const isSelected = selectedColorVariant === variantName;
            const imageUrl = imagesUrls[variantName]?.[0];

            return (
              <TabsTrigger
                key={variantName}
                value={variantName}
                className="p-0 h-auto data-[state=active]:bg-transparent data-[state=active]:shadow-none border-0 hover:bg-transparent max-w-fit"
              >
                <div
                  className={`
                    relative
                    after:rounded-b-sm
                    after:absolute after:left-0 after:right-0 after:bottom-0
                    after:h-1 md:after:h-1.5
                    after:bg-brand
                    after:origin-left
                    after:scale-y-0
                    after:transition-transform after:duration-200
                    ${isSelected ? "after:scale-y-100" : ""}
                  `}
                >
                  <Image
                    src={imageUrl}
                    alt={`Wariant ${variantName}`}
                    width={120}
                    height={120}
                    className={`object-contain min-w-0 aspect-square bg-white rounded-sm`}
                  />
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
                Wybrano kolor:{" "}
                <span className="font-medium text-text">{variantName} </span>
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
    </article>
  );
}
