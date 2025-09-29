"use client";

import { useRouter } from "next/navigation";
import { OfferListingData } from "./ProductsList";
import { ShoppingBasketIcon } from "lucide-react";
import Image from "next/image";
import { Card } from "@/components/ui/card";

export default function ProductFromList({
  offer,
}: {
  offer: OfferListingData;
}) {
  const router = useRouter();

  return (
    <Card
      key={offer.id}
      onClick={() => {
        router.push(`/offer/${offer.id}`);
      }}
      className="hover:translate-y-[-1rem] transition-all duration-200 delay-75 cursor-pointer relative rounded-lg p-0 hover:bg-secondary/50 active:bg-secondary/75"
    >
      <button className="bg-success text-white rounded-full p-2 absolute top-1 left-1 z-10 hover:brightness-75 transition-all">
        <ShoppingBasketIcon className="size-4" />
      </button>
      <Image
        src={offer.thumbnailUrl}
        alt=""
        width={300}
        height={300}
        className="bg-white w-full aspect-square object-contain rounded-t-lg"
      />
      <div className="px-4 py-2">
        <p className="text-lg">{offer.brand || "\u00A0"}</p>
        <p className="text-xl font-medium">{offer.price} zł</p>
      </div>
    </Card>
  );
}
