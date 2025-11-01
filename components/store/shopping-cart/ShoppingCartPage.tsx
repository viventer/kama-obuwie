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

export default function ShoppingCartPage() {
  const { cart, removeFromCart, isLoading } = useShoppingCart();
  const { showToast } = useToast();
  const [offersData, setOffersData] = useState<Record<string, OfferWithId>>({});
  const [loadingOffers, setLoadingOffers] = useState(false);
  const router = useRouter();

  // Fetch offers data for cart items
  const fetchOffersData = useCallback(async () => {
    if (cart.length === 0) {
      setOffersData({});
      return;
    }

    const uniqueOfferIds = [...new Set(cart.map((item) => item.item.offerId))];

    // Check which offers we need to fetch (only new ones)
    const missingOfferIds = uniqueOfferIds.filter(
      (offerId) => !offersData[offerId]
    );

    if (missingOfferIds.length === 0) {
      // We already have all the data we need
      return;
    }

    setLoadingOffers(true);
    try {
      const offersPromises = missingOfferIds.map(async (offerId) => {
        const response = await axios.get(`/api/offers/${offerId}`);
        // API zwraca dane bezpośrednio przez apiResponse spread operator
        return { id: offerId, ...response.data.data };
      });

      const newOffers = await Promise.all(offersPromises);

      const newOffersMap = newOffers.reduce((acc, offer) => {
        acc[offer.id] = offer;
        return acc;
      }, {} as Record<string, OfferWithId>);

      // Merge with existing offers data
      setOffersData((prevData) => ({ ...prevData, ...newOffersMap }));
    } catch (error) {
      console.error("Error fetching offers data:", error);
      showToast("Wystąpił błąd podczas pobierania danych produktów", "error");
    } finally {
      setLoadingOffers(false);
    }
  }, [cart, Object.keys(offersData).join(","), showToast]);

  useEffect(() => {
    fetchOffersData();
  }, [fetchOffersData]);

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
            className="text-xl px-6 w-fit"
            onClick={() => router.push("/checkout/customer-details")}
          >
            Do kasy
          </Button>
        </div>
        <AdvantagesBox price={totalPrice} />
      </div>
    </div>
  );
}
