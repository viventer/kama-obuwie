"use client";

import { useRouter } from "next/navigation";
import ProductFromList from "./ProductFromList";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, Ghost } from "lucide-react";
import { Card } from "@/components/ui/card";

export type OfferListingData = {
  thumbnailUrl: string;
  price: string;
  id: string;
  brand: string | undefined;
};

export default function ProductsList({
  displayName,
  offers,
  categoryName,
}: {
  displayName: string;
  offers: OfferListingData[];
  categoryName: string;
}) {
  const router = useRouter();

  return (
    <section>
      <h3 className="text-2xl font-bold mb-3">{displayName}</h3>
      <div className="flex w-full justify-between">
        <div className="flex gap-12 w-full pr-12">
          {offers.slice(0, 4).map((offer) => (
            <ProductFromList key={offer.id} offer={offer} />
          ))}
        </div>
        <Card
          className="p-0 px-6 flex justify-center cursor-pointer bg-brand/25 transition-colors duration-200 hover:bg-brand/50 active:bg-brand/75"
          onClick={() => router.push("/listing?category=TLNV6amSFBmC0b2iazJO")}
        >
          <Button
            variant={"ghost"}
            onClick={() => router.push(`/listing?categoryName=${categoryName}`)}
            className="hover:translate-x-1 transition-transform w-fit h-fit"
          >
            <ArrowRightIcon className="size-12 hover:translate-x-1 transition-transform" />
          </Button>
        </Card>
      </div>
    </section>
  );
}
