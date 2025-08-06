"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { cn } from "@/lib/utils";
import ReturnItemFromList from "./ReturnItemFromList";
import { useEffect, useState } from "react";
import { getOrderByAllegroId } from "@/server-actions/orders/orders";

interface ReturnItemsDisplayProps {
  items: AllegroReturn["items"];
  allegroOrderId: string;
  className?: string;
}

export type ReturnOffer = {
  thumbnail: string;
  allegroId: string | null;
  signature: string;
};

export function ReturnItemsDisplay({
  items,
  allegroOrderId,
  className,
}: ReturnItemsDisplayProps) {
  const [orderOffers, setOrderOffers] = useState<ReturnOffer[]>([]);

  useEffect(() => {
    (async function () {
      const order = await getOrderByAllegroId(allegroOrderId);
      if (!order) {
        console.error("Order not found for Allegro ID:", allegroOrderId);
        return;
      }
      const offers: ReturnOffer[] = order.lineItems.map((item) => ({
        thumbnail: item.offer.thumbnail,
        allegroId: item.offer.allegroId,
        signature: item.offer.signature,
      }));

      setOrderOffers(offers);
    })();
  }, []);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => {
        const offer = orderOffers.find(
          (offer) => offer.allegroId === item.offerId
        );

        return (
          <ReturnItemFromList
            key={`${item.offerId}-${index}`}
            item={item}
            thumbnail={offer?.thumbnail}
            signature={offer?.signature}
          />
        );
      })}
    </div>
  );
}
