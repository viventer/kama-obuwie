"use client";

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import OfferSelector from "./OfferSelector";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export default function SelectOfferDialog({
  triggerText = "Wybierz ofertę",
  title = "Wybierz ofertę",
  description,
  offers,
  setSelectedOfferId,
  selectedOfferId,
  onConfirm,
  confirmText,
}: {
  triggerText?: string;
  title?: string;
  description?: string;
  offers: OfferWithId[];
  setSelectedOfferId: (offer: string) => void;
  selectedOfferId: string;
  onConfirm?: () => void;
  confirmText?: string;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="px-3 py-2 bg-transparent border-primary border-solid border-1 rounded-xs hover:border-accent hover:cursor-pointer">
        {triggerText}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <OfferSelector
          offers={offers}
          setSelectedOfferId={setSelectedOfferId}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"destructive"}>Anuluj</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (selectedOfferId) {
                onConfirm?.();
                setOpen(false);
              } else {
                showToast("Nie wybrano oferty", "error");
              }
            }}
          >
            {confirmText || "Potwierdź"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
