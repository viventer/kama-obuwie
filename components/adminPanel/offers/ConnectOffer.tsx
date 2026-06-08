"use client";

import SelectOfferDialog from "./SelectOfferDialog";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { useState } from "react";

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

  const connectOffer = async () => {
    const updateData = {
      connectedOffers: [...connectedOffersIds, offerToConnectId],
    };

    try {
      await axios.patch(`/api/offers/${offerId}`, updateData);
    } catch (err) {
      showToast("Nie udało się połączyć oferty", "error");
    }

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
