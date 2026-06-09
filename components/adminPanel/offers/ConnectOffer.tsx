"use client";

import SelectOfferDialog from "./SelectOfferDialog";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { useState } from "react";
import { useFullPageLoading } from "../global/FullPageLoader";

export default function ConnectOffer({
  offerId,
  availableOffers,
  connectedOffersIds,
}: {
  offerId: string;
  availableOffers: OfferWithId[];
  connectedOffersIds: string[];
}) {
  const [offerToConnectId, setOfferToConnectId] = useState("");
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();

  const connectOffer = async () => {
    startLoading();

    const updateData = {
      connectedOffers: [...connectedOffersIds, offerToConnectId],
    };

    try {
      await axios.patch(`/api/offers/${offerId}`, updateData);

      for (const connectedOfferId of [
        ...connectedOffersIds,
        offerToConnectId,
      ]) {
        const updatedConnectedOffers = [
          ...connectedOffersIds,
          offerId,
          offerToConnectId,
        ].filter((id) => id !== connectedOfferId);

        await axios.patch(`/api/offers/${connectedOfferId}`, {
          connectedOffers: updatedConnectedOffers,
        });
      }
    } catch (err) {
      showToast("Nie udało się połączyć oferty", "error");
    }

    stopLoading();
    showToast("Oferta została połączona", "success");
  };

  return (
    <>
      <SelectOfferDialog
        triggerText="Połącz ofertę"
        title="Połącz ofertę"
        availableOffers={availableOffers}
        setSelectedOfferId={setOfferToConnectId}
        selectedOfferId={offerToConnectId}
        onConfirm={async () => await connectOffer()}
        actionText="Połącz"
      />
    </>
  );
}
