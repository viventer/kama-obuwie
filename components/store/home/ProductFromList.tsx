"use client";

import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import Link from "next/link";
import ProductPrice from "@/components/store/product/ProductPrice";

export default function ProductFromList({
  product,
}: {
  product: ProductListingData;
}) {
  return (
    <Card
      key={product.id}
      className="md:hover:translate-y-[-1rem] transition-all duration-200 delay-75 cursor-pointer relative p-0 hover:bg-card/50 gap-0 rounded-xs hover:shadow-md bg-card h-full"
    >
      <Link
        href={`/product/${product.id}?colorVariantName=${encodeURIComponent(
          product.colorVariantName,
        )}`}
      >
        {/* Button for adding to cart - todo */}
        {/* <button className="bg-success text-white rounded-full p-2 absolute top-1 left-1 md:top-2 md:left-2 z-10 hover:brightness-115 hover:shadow-lg hover:shadow-success transition-all cursor-pointer">
        <ShoppingBasketIcon className="size-6 md:size-8" />
      </button> */}
        <div className="w-full aspect-square bg-white rounded-t-xs flex justify-center items-center">
          <Image
            src={product.thumbnailUrl}
            alt=""
            width={300}
            height={300}
            className="object-contain rounded-t-xs w-full"
          />
        </div>

        <div className="py-2 px-2 xs:px-3">
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
        </div>
      </Link>
    </Card>
  );
}
