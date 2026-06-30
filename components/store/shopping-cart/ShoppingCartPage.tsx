"use client";

import { useShoppingCart } from "@/app/providers/ShoppingCartProvider";
import { useToast } from "@/hooks/useToast";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import ShoppingCartPageSkeleton from "@/components/store/loading/ShoppingCartPageSkeleton";
import { useEffect, useState, useCallback } from "react";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import ShoppingCartItem from "./ShoppingCartItem";
import { Button } from "@/components/ui/button";
import AdvantagesBox from "../product/AdvantagesBox";
import TrustmateWidget from "../global/TrustmateWidget";
import { useRouter } from "next/navigation";
import ShippingInfo from "../global/ShippingInfo";
import { Card, CardContent } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import {
  fetchOffersData,
  checkCartItemsAvailability,
} from "@/helpers/checkCartAvailability";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import LinkText from "@/components/adminPanel/global/LinkText";
import { analytics } from "@/firebase/firebase";
import { logEvent } from "firebase/analytics";
import { ItemType } from "@/firebase/schemas/analyticsSchemas";

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
  const [termsAccepted, setTermsAccepted] = useState(false);
  const router = useRouter();

  const fetchOffers = async () => {
    if (cart.length === 0) {
      setOffersData({});
      return;
    }

    setLoadingOffers(true);
    try {
      const newOffersData = await fetchOffersData(cart, offersData);
      setOffersData(newOffersData);
    } catch (error) {
      console.error("Error fetching offers data:", error);
      showToast("Wystąpił błąd podczas pobierania danych produktów", "error");
    } finally {
      setLoadingOffers(false);
    }
  };

  const checkAvailability = useCallback(async () => {
    if (cart.length === 0) return;

    checkCartItemsAvailability(cart, offersData, updateItemAvailability);
  }, [cart, offersData]);

  useEffect(() => {
    if (isLoading) return;
    if (analytics) {
      logEvent(analytics, "view_cart", {
        items: cart.map(
          (cartItem) =>
            ({
              item_id: offersData[cartItem.item.offerId]?.SKU,
              item_name: offersData[cartItem.item.offerId]?.signature,
              item_brand: cartItem.item.brand,
              item_category: cartItem.item.categoryName,
              price: cartItem.item.price,
              size: cartItem.item.size,
              quantity: cartItem.item.quantity,
              item_variant: cartItem.item.formattedMainColor,
            }) as ItemType,
        ),
        value: cart.reduce(
          (sum, cartItem) => sum + cartItem.item.price * cartItem.item.quantity,
          0,
        ),
        currency: "PLN",
      });
    }

    (async () => {
      await fetchOffers();
    })();
  }, [isLoading, cart]);

  useEffect(() => {
    checkAvailability();
  }, [offersData]);

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    showToast(`Usunięto ${itemName} z koszyka`, "success");
  };

  if (isLoading || loadingOffers) {
    return <ShoppingCartPageSkeleton itemCount={Math.max(cart.length, 2)} />;
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
    <div className="max-w-4xl mx-auto my-4">
      <SubpageHeading text="koszyk" />

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

      <div className="mt-6 pt-4 border-t border-border flex flex-col md:flex-row md:justify-between gap-x-4 gap-y-8">
        <div className="flex-1">
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
          <div className="flex items-center mb-4 gap-2">
            <Checkbox
              id="terms"
              className="size-4"
              checked={termsAccepted}
              onCheckedChange={(value) => setTermsAccepted(value as boolean)}
            />
            <Label htmlFor="terms" className="gap-1 flex-wrap">
              Akceptuję{" "}
              <LinkText className="text-nowrap" href={"/info/regulations"}>
                regulamin sklepu
              </LinkText>{" "}
              i{" "}
              <LinkText className="text-nowrap" href={"/info/privacy"}>
                politykę prywatności.
              </LinkText>
            </Label>
          </div>
          {hasUnavailableItems().hasUnavailable ? (
            <Card className="py-0 border-destructive mb-4 max-w-fit">
              <CardContent className="px-4 py-3 flex items-start gap-2">
                <InfoIcon className="size-6 text-destructive" />
                Aby dokonać zakupu usuń niedostępne produkty z koszyka.
              </CardContent>
            </Card>
          ) : !termsAccepted ? (
            <Card className="py-0 border-destructive mb-4 max-w-fit">
              <CardContent className="px-4 py-3 flex items-center gap-2">
                <InfoIcon className="size-8 text-destructive" />
                Aby przejść do kasy, zaakceptuj regulamin sklepu i politykę
                prywatności.
              </CardContent>
            </Card>
          ) : null}
          <Button
            variant={"important"}
            className="text-xl px-6 w-fit mb-2 mt-4"
            disabled={hasUnavailableItems().hasUnavailable || !termsAccepted}
            onClick={() => {
              if (analytics) {
                logEvent(analytics, "begin_checkout", {
                  items: cart.map(
                    (cartItem) =>
                      ({
                        item_id: offersData[cartItem.item.offerId]?.SKU,
                        item_name: offersData[cartItem.item.offerId]?.signature,
                        item_brand: cartItem.item.brand,
                        item_category: cartItem.item.categoryName,
                        price: cartItem.item.price,
                        size: cartItem.item.size,
                        quantity: cartItem.item.quantity,
                        item_variant: cartItem.item.formattedMainColor,
                      }) as ItemType,
                  ),
                  value: cart.reduce(
                    (sum, cartItem) =>
                      sum + cartItem.item.price * cartItem.item.quantity,
                    0,
                  ),
                  currency: "PLN",
                });
              }

              router.push("/checkout");
            }}
          >
            Do kasy
          </Button>
          <ShippingInfo />
        </div>
        <div className="flex flex-col gap-4">
          <AdvantagesBox className="h-fit" />
          <TrustmateWidget className="bg-card rounded-xs" />
        </div>
      </div>
    </div>
  );
}
