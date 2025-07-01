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
import ProductSelector from "./ProductSelector";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useToast } from "@/hooks/useToast";

export default function SelectProductDialog({
  triggerText = "Wybierz produkt",
  title = "Wybierz produkt",
  description,
  availableProducts,
  setSelectedProductId,
  selectedProductId,
  onConfirm,
}: {
  triggerText?: string;
  title?: string;
  description?: string;
  availableProducts: ProductWithId[];
  setSelectedProductId: (product: string) => void;
  selectedProductId: string;
  onConfirm?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const { showToast } = useToast();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger className="px-3 py-2 bg-transparent border-primary border-solid border-1 rounded-sm hover:border-accent hover:cursor-pointer">
        {triggerText}
      </DialogTrigger>
      <DialogContent className="max-h-[90svh]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <ProductSelector
          availableProducts={availableProducts}
          setSelectedProductId={setSelectedProductId}
        />
        <DialogFooter>
          <DialogClose asChild>
            <Button variant={"destructive"}>Anuluj</Button>
          </DialogClose>
          <Button
            onClick={() => {
              if (selectedProductId) {
                onConfirm?.();
                setOpen(false);
              } else {
                showToast("Nie wybrano produktu", "error");
              }
            }}
          >
            Zaimportuj opis
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
