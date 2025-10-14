"use client";

import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import ProductImagesSlider from "./ProductImagesSlider";
import SelectProductVariant from "./SelectProductVariant";
import SelectSize from "./SelectSize";
import SizingTableDialog from "./SizingTableDialog";
import { useState } from "react";
import { getColorVariantName } from "@/components/adminPanel/assortment/helpers/productsHelpers";
import { notFound, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getShippingInfo } from "@/helpers/store";
import { ClockIcon, TagIcon } from "lucide-react";
import AdvantagesBox from "./AdvantagesBox";
import ProductSpecifications from "./ProductSpecifications";
import { useDialogWindow } from "@/components/providers/DialogWindowProvider";

export default function ProductPage({
  imagesUrls,
  productData,
  category,
  initialColorVariantName,
  offersData,
  sizingTable,
  choosingSizeImageUrl,
}: {
  imagesUrls: Record<string, string[]>;
  productData: ProductWithId;
  category: CategoryWithId;
  initialColorVariantName?: string;
  offersData: Record<string, OfferWithId>;
  sizingTable?: SizingTableWithId;
  choosingSizeImageUrl?: string;
}) {
  if (!productData.colorVariants) {
    notFound();
  }

  const validInitialVariant =
    initialColorVariantName &&
    productData.colorVariants.some(
      (variant) => getColorVariantName(variant) === initialColorVariantName
    )
      ? initialColorVariantName
      : getColorVariantName(productData.colorVariants[0]);

  const [selectedColorVariant, setSelectedColorVariant] =
    useState(validInitialVariant);

  const [selectedSize, setSelectedSize] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();

  const handleVariantChange = (newVariant: string) => {
    setSelectedColorVariant(newVariant);
    setSelectedSize("");

    const params = new URLSearchParams(searchParams);
    params.set("colorVariantName", newVariant);
    router.replace(`/product/${productData.id}?${params.toString()}`, {
      scroll: false,
    });
  };

  const currentOffer = offersData[selectedColorVariant];

  const price = Number(
    offersData[selectedColorVariant].sellingPrices.DTC
  ) as number;

  const { openDialog } = useDialogWindow();

  const showSizingTable = () => {
    if (!sizingTable) return;

    openDialog({
      title: "Tabela rozmiarów",
      content: (
        <SizingTableDialog
          sizingTable={sizingTable}
          choosingSizeImageUrl={choosingSizeImageUrl}
        />
      ),
      hasCancelButton: false,
    });
  };

  return (
    <div className="flex gap-8">
      <div className="flex flex-col gap-8">
        <ProductImagesSlider imagesUrls={imagesUrls[selectedColorVariant]} />
        <ProductSpecifications productParameters={productData.parameters} />
      </div>
      <div className="w-full flex flex-col gap-6">
        <article className="bg-primary/50 rounded-sm px-4 py-2">
          <h2 className="capitalize font-bold text-xl text-white">
            {category.name}
          </h2>
          <p className="text-lg">
            {productData?.brand}{" "}
            <span className="font-thin">{productData.manufacturerCode}</span>
          </p>
        </article>
        <div className="border-2 border-success brightness-150 w-fit px-4 py-3 rounded-sm flex gap-2 items-center">
          <TagIcon className="text-success" />
          <p className="text-2xl font-medium">
            {new Intl.NumberFormat("pl-PL", {
              style: "currency",
              currency: "PLN",
              minimumFractionDigits: 2,
            }).format(price)}
          </p>
        </div>
        <SelectProductVariant
          colorVariants={productData.colorVariants}
          imagesUrls={imagesUrls}
          selectedColorVariant={selectedColorVariant}
          onVariantChange={handleVariantChange}
        />
        <section>
          {currentOffer && currentOffer.availability && (
            <SelectSize
              availability={currentOffer.availability}
              selectedSize={selectedSize}
              onSizeChange={setSelectedSize}
            />
          )}
          {sizingTable && (
            <Button
              variant={"outline"}
              className="w-fit "
              onClick={showSizingTable}
            >
              Tabela rozmiarów
            </Button>
          )}
        </section>
        <article>
          <Button className="w-full max-w-[300px] text-xl font-bold px-8 py-6 bg-primary text-white hover:brightness-125 hover:bg-primary mb-2">
            Dodaj do koszyka
          </Button>
          <p className="flex items-center gap-2 font-medium">
            <ClockIcon className="size-5 text-success brightness-150" />
            {getShippingInfo()}
          </p>
        </article>
        <AdvantagesBox price={price} />
      </div>
    </div>
  );
}
