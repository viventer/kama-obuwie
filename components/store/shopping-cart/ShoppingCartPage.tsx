"use client";

import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import IconButton from "@/components/adminPanel/global/IconButton";
import { EditIcon, TrashIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import Loader from "@/components/adminPanel/global/Loader";
import EditCartItemDialog from "./EditCartItemDialog";
import { useEffect, useState } from "react";
import axios from "axios";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export default function ShoppingCartPage() {
  const { cart, removeFromCart, isLoading } = useShoppingCart();
  const { showToast } = useToast();
  const [offersData, setOffersData] = useState<Record<string, OfferWithId>>({});
  const [loadingOffers, setLoadingOffers] = useState(false);

  // Fetch offers data for cart items
  useEffect(() => {
    const fetchOffersData = async () => {
      if (cart.length === 0) return;

      setLoadingOffers(true);
      try {
        const uniqueOfferIds = [
          ...new Set(cart.map((item) => item.item.offerId)),
        ];
        const offersPromises = uniqueOfferIds.map(async (offerId) => {
          const response = await axios.get(`/api/offers/${offerId}`);
          // API zwraca dane bezpośrednio przez apiResponse spread operator
          return { id: offerId, ...response.data.data };
        });

        const offers = await Promise.all(offersPromises);

        const offersMap = offers.reduce((acc, offer) => {
          acc[offer.id] = offer;
          return acc;
        }, {} as Record<string, OfferWithId>);

        setOffersData(offersMap);
      } catch (error) {
        console.error("Error fetching offers data:", error);
        showToast("Wystąpił błąd podczas pobierania danych produktów", "error");
      } finally {
        setLoadingOffers(false);
      }
    };

    fetchOffersData();
  }, [cart]);

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

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Koszyk</h1>

      <div className="space-y-4">
        {cart.map((cartItem) => (
          <Card key={cartItem.id}>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-24 h-24 relative">
                  <Image
                    src={cartItem.item.thumbnailUrl}
                    alt={`${cartItem.item.brand || ""} ${
                      cartItem.item.categoryName
                    }`}
                    fill
                    className="object-contain rounded-xl bg-white"
                    sizes="80px"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-xl truncate text-card-foreground capitalize">
                    {cartItem.item.categoryName} {cartItem.item.brand}
                  </h3>
                  <p className="text-text text-lg mb-1">
                    {new Intl.NumberFormat("pl-PL", {
                      style: "currency",
                      currency: "PLN",
                      minimumFractionDigits: 2,
                    }).format(cartItem.item.price)}
                  </p>
                  <div className="flex items-center gap-4 text-muted-foreground">
                    <span>r. {cartItem.item.size}</span>
                    <span>ilość: {cartItem.item.quantity}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  {offersData[cartItem.item.offerId] && (
                    <EditCartItemDialog
                      cartItem={cartItem}
                      availability={
                        offersData[cartItem.item.offerId].availability
                      }
                    >
                      <IconButton title="Edytuj">
                        <EditIcon size={20} />
                      </IconButton>
                    </EditCartItemDialog>
                  )}

                  <IconButton
                    title="Usuń z koszyka"
                    className="text-destructive hover:text-text"
                    onClick={() =>
                      handleRemoveItem(
                        cartItem.id,
                        `${cartItem.item.categoryName} ${
                          cartItem.item.brand || ""
                        }`
                      )
                    }
                  >
                    <TrashIcon size={20} />
                  </IconButton>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
