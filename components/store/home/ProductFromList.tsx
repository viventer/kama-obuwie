"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card } from "@/components/ui/card";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export default function ProductFromList({
  product,
}: {
  product: ProductListingData;
}) {
  const router = useRouter();

  return (
    <Card
      key={product.id}
      onClick={() => {
        router.push(
          `/product/${product.id}?colorVariantName=${encodeURIComponent(
            product.colorVariantName
          )}`
        );
      }}
      className="hover:translate-y-[-1rem] transition-all duration-200 delay-75 cursor-pointer relative rounded-lg p-0 hover:bg-secondary/50 active:bg-secondary/75 max-w-[300px]"
    >
      {/* Button for adding to cart - todo */}
      {/* <button className="bg-success text-white rounded-full p-2 absolute top-1 left-1 md:top-2 md:left-2 z-10 hover:brightness-115 hover:shadow-lg hover:shadow-success transition-all cursor-pointer">
        <ShoppingBasketIcon className="size-6 md:size-8" />
      </button> */}
      <div className="w-full aspect-square bg-white rounded-t-lg flex justify-center items-center">
        <Image
          src={product.thumbnailUrl}
          alt=""
          width={300}
          height={300}
          className="object-contain rounded-t-lg"
        />
      </div>

      <div className="px-4 py-2">
        <p className="text-lg">
          {product.brand && product.brand != "bez marki"
            ? product.brand
            : "\u00A0"}
        </p>
        <p className="text-xl font-medium">{product.price} zł</p>
      </div>
    </Card>
  );
}
