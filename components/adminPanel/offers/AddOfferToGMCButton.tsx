"use client";

import SelectOfferDialog from "./SelectOfferDialog";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { useFullPageLoading } from "../global/FullPageLoader";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AddOfferToGMCButton({
  offers,
}: {
  offers: OfferWithId[];
}) {
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [titleDialogOpen, setTitleDialogOpen] = useState(false);
  const [gmcTitle, setGmcTitle] = useState("");
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();

  const openTitleDialog = () => {
    const selectedOffer = offers.find((offer) => offer.id === selectedOfferId);
    if (!selectedOffer) return;
    setGmcTitle(selectedOffer.merchantCenterData?.title ?? selectedOffer.title);
    setTitleDialogOpen(true);
  };

  const addOfferToGMC = async () => {
    if (!selectedOfferId) return;

    const title = gmcTitle.trim();
    if (title.length < 3) {
      showToast("Tytuł musi mieć co najmniej 3 znaki.", "error");
      return;
    }

    try {
      startLoading();
      await axios.post(`/api/merchant-center/offer/${selectedOfferId}`, {
        title,
      });
      stopLoading();
      setTitleDialogOpen(false);
      showToast("Oferta dodana do Google Merchant Center", "success");
    } catch (err) {
      stopLoading();
      console.error("Error adding offer to GMC:", err);
      const apiMessage =
        axios.isAxiosError(err) &&
        typeof err.response?.data?.message === "string"
          ? err.response.data.message
          : null;
      showToast(
        apiMessage ||
          "Błąd podczas dodawania oferty do GMC (brakujące dane).",
        "error",
      );
    }
  };

  return (
    <>
      <SelectOfferDialog
        availableOffers={offers}
        setSelectedOfferId={setSelectedOfferId}
        selectedOfferId={selectedOfferId}
        onConfirm={openTitleDialog}
        actionText="Dodaj do GMC"
      />
      <Dialog open={titleDialogOpen} onOpenChange={setTitleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tytuł oferty dla Google Merchant Center</DialogTitle>
            <DialogDescription>
              Tytuł zostanie użyty przy tworzeniu produktu w Google Merchant
              Center. Możesz go zmienić bez wpływu na tytuł oferty w bazie.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor="gmc-title">Tytuł</Label>
            <Input
              id="gmc-title"
              value={gmcTitle}
              onChange={(event) => setGmcTitle(event.target.value)}
              maxLength={140}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant={"destructive"}>Anuluj</Button>
            </DialogClose>
            <Button onClick={addOfferToGMC}>Dodaj do GMC</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
