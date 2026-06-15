"use client";

import { Button } from "@/components/ui/button";
import SelectOfferDialog from "./SelectOfferDialog";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { useFullPageLoading } from "../global/FullPageLoader";

export default function AddOfferToGMCButton({
  offers,
}: {
  offers: OfferWithId[];
}) {
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();

  const addOfferToGMC = async () => {
    if (!selectedOfferId) return;
    console.log(selectedOfferId);

    try {
      startLoading();
      console.log("Adding offer to GMC with ID:", selectedOfferId);
      await axios.post(`/api/merchant-center/offer/${selectedOfferId}`);
      stopLoading();
      showToast("Oferta dodana do Google Merchant Center", "success");
    } catch (err) {
      stopLoading();
      console.error("Error adding offer to GMC:", err);
      showToast(
        "Błąd podczas dodawania oferty do GMC (brakujące dane).",
        "error",
      );
    }
  };

  return (
    <SelectOfferDialog
      availableOffers={offers}
      setSelectedOfferId={setSelectedOfferId}
      selectedOfferId={selectedOfferId}
      onConfirm={addOfferToGMC}
      actionText="Dodaj do GMC"
    />
  );
}
