"use client";

import { Button } from "@/components/ui/button";
import axios from "axios";
import { TrashIcon } from "lucide-react";
import { useFullPageLoading } from "../global/FullPageLoader";
import { useToast } from "@/hooks/useToast";

export default function DisconnectOffer({
  offerId,
  oldConnectedOfferIds,
  offerToDisconnectId,
}: {
  offerId: string;
  oldConnectedOfferIds: string[];
  offerToDisconnectId: string;
}) {
  const { startLoading, stopLoading } = useFullPageLoading();
  const { showToast } = useToast();

  const disconnect = async () => {
    startLoading();

    const newConnectedOffers = [...oldConnectedOfferIds].filter(
      (id) => id !== offerToDisconnectId,
    );

    const updateData = {
      connectedOffers: newConnectedOffers,
    };

    try {
      axios.patch(`/api/offers/${offerId}`, updateData);

      for (const connectedOfferId of newConnectedOffers) {
        await axios.patch(`/api/offers/${connectedOfferId}`, {
          connectedOffers: [...newConnectedOffers, offerId].filter(
            (id) => id !== connectedOfferId,
          ),
        });
      }

      axios.patch(`/api/offers/${offerToDisconnectId}`, {
        connectedOffers: [],
      });
    } catch (err) {
      showToast("Błąd aktualizacji oferty", "error");
    }

    showToast("Oferta została odłączona");
    stopLoading();
  };

  return (
    <Button variant={"ghost"} onClick={async () => await disconnect()}>
      <TrashIcon className="text-destructive size-5" />
    </Button>
  );
}
