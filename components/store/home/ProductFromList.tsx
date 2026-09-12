"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { cubicBezier, motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import ProductPrice from "@/components/store/product/ProductPrice";
import AiImageBadge from "@/components/store/global/AiImageBadge";
import ProductFromListHoverDetails from "@/components/store/home/ProductFromListHoverDetails";
import { buildProductPagePath } from "@/helpers/productUrl";
import { useBreakpoint } from "@/hooks/useBreakpoint";

const paddingTransition = {
  duration: 0.25,
  ease: cubicBezier(0.22, 1, 0.36, 1),
};

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
  const restPadding = 12 as const;

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
        <motion.div
          className="relative w-full aspect-square bg-white rounded-t-xs flex justify-center items-center"
          initial={false}
          animate={
            isHovered
              ? { paddingTop: 0, paddingBottom: 24 }
              : { paddingTop: restPadding, paddingBottom: restPadding }
          }
          transition={paddingTransition}
        >
          <Image
            src={previewVariant.thumbnailUrl}
            alt=""
            width={300}
            height={300}
            priority={priority}
            sizes={sizes}
            className="object-contain rounded-t-xs w-full"
          />
        </motion.div>
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
