"use client";

import { useShoppingCart } from "@/app/providers/ShoppingCartProvider";
import { useToast } from "@/hooks/useToast";
import Loader from "@/components/adminPanel/global/Loader";
import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import ShoppingCartItem from "./ShoppingCartItem";
import { Button } from "@/components/ui/button";
import AdvantagesBox from "../product/AdvantagesBox";
import { useRouter } from "next/navigation";
import ShippingInfo from "../global/ShippingInfo";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";

export default function ShoppingCartPage() {
  const {
    cart,
    removeFromCart,
    isLoading,
    updateItemAvailability,
    hasUnavailableItems,
  } = useShoppingCart();
  const { showToast } = useToast();
  const [offersData, setOffersData] = useState<Record<string, OfferWithId>>({});
  const [loadingOffers, setLoadingOffers] = useState(false);
  const router = useRouter();

  const fetchOffersData = async () => {
    if (cart.length === 0) {
      setOffersData({});
      return;
    }

    const uniqueOfferIds = [...new Set(cart.map((item) => item.item.offerId))];

    const missingOfferIds = uniqueOfferIds.filter(
      (offerId) => !offersData[offerId]
    );

    if (missingOfferIds.length === 0) {
      return;
    }

    setLoadingOffers(true);
    try {
      const offersPromises = missingOfferIds.map(async (offerId) => {
        const response = await axios.get(`/api/offers/${offerId}`);
        return { id: offerId, ...response.data.data };
      });

      const newOffers: OfferWithId[] = await Promise.all(offersPromises);

      const newOffersMap = newOffers.reduce((acc, offer) => {
        acc[offer.id] = offer;
        return acc;
      }, {} as Record<string, OfferWithId>);

      setOffersData((prevData) => ({ ...prevData, ...newOffersMap }));
    } catch (error) {
      console.error("Error fetching offers data:", error);
      showToast("Wystąpił błąd podczas pobierania danych produktów", "error");
    } finally {
      setLoadingOffers(false);
    }
  };

  const checkAvailability = useCallback(async () => {
    if (cart.length === 0) return;

    // Check availability for each cart item
    for (const cartItem of cart) {
      const offer = offersData[cartItem.item.offerId];
      if (offer && offer.availability[cartItem.item.size]) {
        const availableQuantity = parseInt(
          offer.availability[cartItem.item.size].value || "0"
        );
        const isAvailable = availableQuantity >= cartItem.item.quantity;

        // Update availability status if it has changed
        if (cartItem.item.isAvailable !== isAvailable) {
          updateItemAvailability(cartItem.id, isAvailable);
        }
      }
    }
  }, [cart, offersData]);

  useEffect(() => {
    fetchOffersData();
    checkAvailability();
  }, []);

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    showToast(`Usunięto ${itemName} z koszyka`, "success");
  };

  if (isLoading || loadingOffers) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-xs">
        <Loader />
      </div>
    );
  }

  if (cart.length === 0 && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-center">
        <h2 className="text-2xl font-bold mb-2 text-foreground">
          Koszyk jest pusty
        </h2>
        <p className="text-muted-foreground">
          Dodaj produkty do koszyka, aby je tutaj zobaczyć
        </p>
      </div>
    );
  }

  const totalPrice = cart.reduce((sum, cartItem) => {
    return sum + cartItem.item.price * cartItem.item.quantity;
  }, 0);

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Koszyk</h1>

      <div className="space-y-4">
        {cart.map((cartItem) => (
          <ShoppingCartItem
            key={cartItem.id}
            cartItem={cartItem}
            offerData={offersData[cartItem.item.offerId]}
            onRemove={handleRemoveItem}
          />
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row md:justify-between gap-4">
        <div>
          <div className="flex items-center mb-4">
            <p className="text-xl font-bold text-foreground">
              Do zapłaty:{" "}
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
                minimumFractionDigits: 2,
              }).format(totalPrice)}
            </p>
          </div>
          <Button
            variant={"important"}
            className="text-xl px-6 w-fit mb-2"
            disabled={hasUnavailableItems().hasUnavailable}
            onClick={() => router.push("/checkout")}
          >
            Do kasy
          </Button>
          {hasUnavailableItems().hasUnavailable && (
            <Card className="py-0 border-accent mb-4 max-w-fit">
              <CardContent className="px-4 py-3 flex items-start gap-2">
                <InfoIcon className="size-6 text-accent" />
                Aby dokonać zakupu usuń niedostępne produkty z koszyka.
              </CardContent>
            </Card>
          )}
          <ShippingInfo />
        </div>
        <AdvantagesBox price={totalPrice} />
      </div>
    </div>
  );
}
