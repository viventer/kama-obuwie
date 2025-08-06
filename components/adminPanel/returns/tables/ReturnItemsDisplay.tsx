"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { cn } from "@/lib/utils";
import ReturnItemFromList from "./ReturnItemFromList";
import MiniLoader from "../../global/MiniLoader";
import { useOrderOffers } from "@/hooks/useOrderCache";
import { useToast } from "@/hooks/useToast";

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
  const { orderOffers, loading, error } = useOrderOffers(allegroOrderId);
  const { showToast } = useToast();

  if (loading) {
    return <MiniLoader />;
  }

  if (error) {
    showToast("Błąd ładowania danych ofert", "error");
    return;
  }

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
