"use client";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { ShoppingBasketIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
      <h3 className="text-lg font-medium">{displayName}</h3>
      <div className="flex gap-2 mt-2">
        {offers.map((offer) => (
          <article
            key={offer.id}
            onClick={() => {
              router.push(`/offer/${offer.id}`);
            }}
            className="hover:translate-y-2 transition-transform cursor-pointer relative"
          >
            <button className="bg-success text-white rounded-full p-2 absolute top-1 left-1 z-10 hover:brightness-75 transition-all">
              <ShoppingBasketIcon className="size-4" />
            </button>
            <Image src={offer.thumbnailUrl} alt="" width={300} height={300} />
            {offer?.brand && <p>{offer.brand}</p>}
            <p className="font-medium">{offer.price}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
