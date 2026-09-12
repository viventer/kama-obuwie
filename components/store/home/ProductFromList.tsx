"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductPrice from "@/components/store/product/ProductPrice";
import AiImageBadge from "@/components/store/global/AiImageBadge";
import ProductFromListHoverDetails from "@/components/store/home/ProductFromListHoverDetails";
import { buildProductPagePath } from "@/helpers/productUrl";
import { useBreakpoint } from "@/hooks/useBreakpoint";

export default function ProductFromList({
  product,
  priority = false,
  sizes,
  variants,
}: {
  product: ProductListingData;
  priority?: boolean;
  sizes?: string;
  variants?: ProductListingData[];
}) {
  const { isAtLeast } = useBreakpoint();
  const [isHovered, setIsHovered] = useState(false);
  const [hoveredVariant, setHoveredVariant] = useState<string | null>(null);

  const previewName = hoveredVariant ?? product.colorVariantName;
  const previewVariant =
    variants?.find((variant) => variant.colorVariantName === previewName) ??
    product;

  const ownHref = buildProductPagePath({
    id: product.id,
    colorVariantName: product.colorVariantName,
  });

  return (
    <Card
      key={product.id}
      className="relative p-0 gap-0 rounded-xs bg-card h-full cursor-pointer hover:bg-card/50 hover:shadow-md transition-all duration-200 delay-75 overflow-hidden"
      onMouseEnter={() => {
        if (isAtLeast("md")) setIsHovered(true);
      }}
      onMouseLeave={() => {
        setIsHovered(false);
        setHoveredVariant(null);
      }}
    >
      {product.isThumbnailAiCoCreated && <AiImageBadge />}
      <Link href={ownHref} className="block">
        <div className="relative py-2 sm:py-4 w-full aspect-square bg-white rounded-t-xs flex justify-center items-center">
          <Image
            src={previewVariant.thumbnailUrl}
            alt=""
            width={300}
            height={300}
            priority={priority}
            sizes={sizes}
            className="object-contain rounded-t-xs w-full"
          />
        </div>
      </Link>

      <div className="relative z-10 bg-card py-2 px-2 xs:px-3">
        <ProductFromListHoverDetails
          isVisible={isHovered}
          product={product}
          variants={variants}
          previewVariant={previewVariant}
          ownHref={ownHref}
          onHoverVariant={setHoveredVariant}
        />

        <Link href={ownHref} className="block">
          <p className="text-base xs:text-lg capitalize">
            {product.brand && product.brand != "bez marki"
              ? product.brand
              : "\u00A0"}
          </p>
          <ProductPrice
            variant="listing"
            currentPrice={Number(product.price)}
            reference={
              product.lowestPrice30d != null
                ? Number(product.lowestPrice30d)
                : null
            }
          />
        </Link>
      </div>
    </Card>
  );
}
