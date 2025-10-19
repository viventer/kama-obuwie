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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/useToast";
import { useShoppingCart } from "@/contexts/ShoppingCartContext";
import SelectSize from "../product/SelectSize";
import { Availability } from "@/firebase/schemas/offersSchemas";
import { z } from "zod";
import { shoppingCartItemSchema } from "@/firebase/schemas/shoppingCartSchemas";

type ShoppingCartItem = z.infer<typeof shoppingCartItemSchema>;

export default function EditCartItemDialog({
  cartItem,
  availability,
  children,
}: {
  cartItem: ShoppingCartItem;
  availability: Record<string, Availability>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState(cartItem.item.size);
  const [quantity, setQuantity] = useState(cartItem.item.quantity);
  const { showToast } = useToast();
  const {
    updateQuantity,
    removeFromCart,
    findExistingItem,
    addToCart,
    replaceCartItem,
  } = useShoppingCart();

  useEffect(() => {
    if (open) {
      setSelectedSize(cartItem.item.size);
      setQuantity(cartItem.item.quantity);
    }
  }, [open]);

  const getMaxQuantity = (size: string): number => {
    const sizeAvailability = availability[size];
    if (
      !sizeAvailability ||
      sizeAvailability.value === "0" ||
      sizeAvailability.value === ""
    ) {
      return 0;
    }
    return parseInt(sizeAvailability.value) || 0;
  };

  const maxQuantity = getMaxQuantity(selectedSize);

  const handleSizeChange = (newSize: string) => {
    setSelectedSize(newSize);
    const maxForNewSize = getMaxQuantity(newSize);
    setQuantity(Math.min(1, maxForNewSize));
  };

  const handleQuantityChange = (newQuantity: number) => {
    const clampedQuantity = Math.max(1, Math.min(newQuantity, maxQuantity));
    setQuantity(clampedQuantity);
  };

  const handleConfirm = () => {
    if (!selectedSize) {
      showToast("Proszę wybrać rozmiar", "error");
      return;
    }

    if (quantity < 1) {
      showToast("Ilość musi być większa niż 0", "error");
      return;
    }

    if (quantity > maxQuantity) {
      showToast(`Maksymalna dostępna ilość: ${maxQuantity}`, "error");
      return;
    }

    if (selectedSize !== cartItem.item.size) {
      const existingItem = findExistingItem(
        cartItem.item.offerId,
        cartItem.item.productId,
        selectedSize
      );

      if (existingItem) {
        const newQuantity = existingItem.item.quantity + quantity;
        const maxForSize = getMaxQuantity(selectedSize);

        if (newQuantity > maxForSize) {
          showToast(
            `Nie można dodać więcej. Maksymalna dostępna ilość dla rozmiaru ${selectedSize}: ${maxForSize}`,
            "error"
          );
          return;
        }

        updateQuantity(existingItem.id, newQuantity);
        removeFromCart(cartItem.id);
        showToast(
          `Zaktualizowano produkt - rozmiar zmieniony na ${selectedSize}`,
          "success"
        );
      } else {
        try {
          // Użyj atomowej operacji zastąpienia elementu
          replaceCartItem(cartItem.id, {
            offerId: cartItem.item.offerId,
            productId: cartItem.item.productId,
            thumbnailUrl: cartItem.item.thumbnailUrl,
            categoryName: cartItem.item.categoryName,
            brand: cartItem.item.brand,
            price: cartItem.item.price,
            size: selectedSize,
            formattedMainColor: cartItem.item.formattedMainColor,
            formattedAdditionalColor: cartItem.item.formattedAdditionalColor,
            quantity: quantity,
          });
          showToast(
            `Zaktualizowano produkt - rozmiar zmieniony na ${selectedSize}`,
            "success"
          );
        } catch (error) {
          showToast("Wystąpił błąd podczas aktualizacji produktu", "error");
          return;
        }
      }
    } else {
      updateQuantity(cartItem.id, quantity);
      showToast("Zaktualizowano ilość produktu", "success");
    }

    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-h-[90svh] max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">Edytuj przedmiot</DialogTitle>
          <DialogDescription className="capitalize">
            {cartItem.item.categoryName} {cartItem.item.brand}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <SelectSize
            availability={availability}
            selectedSize={selectedSize}
            onSizeChange={handleSizeChange}
          />

          <div className="space-y-2">
            <Label htmlFor="quantity" className="text-lg font-normal">
              Ilość
            </Label>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity - 1)}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxQuantity}
                value={quantity}
                onChange={(e) =>
                  handleQuantityChange(parseInt(e.target.value) || 1)
                }
                className="w-16 text-center no-spinner"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuantityChange(quantity + 1)}
                disabled={quantity >= maxQuantity}
              >
                +
              </Button>
            </div>
          </div>
        </div>

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Anuluj</Button>
          </DialogClose>
          <Button variant={"important"} onClick={handleConfirm}>
            Zapisz zmiany
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
