"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import { truncateString } from "@/lib/utils";
import Link from "next/link";

export default function ProductFromList({
  product,
}: {
  product: ProductListingData;
}) {
  const router = useRouter();

  return (
    <Card
      key={product.id}
      className="md:hover:translate-y-[-1rem] transition-all duration-200 delay-75 cursor-pointer relative p-0 hover:bg-card/50 gap-0 rounded-xs hover:shadow-md bg-card"
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
          <p className="text-lg md:text-xl font-medium">{product.price} zł</p>
        </div>
      </Link>
    </Card>
  );
}
