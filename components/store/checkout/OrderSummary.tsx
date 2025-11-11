"use client";

import { useShoppingCart } from "@/hooks/useShoppingCart";
import ShoppingCartItem from "../shopping-cart/ShoppingCartItem";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ShippingInfo from "../global/ShippingInfo";
import { Button } from "@/components/ui/button";
import { UseFormReturn } from "react-hook-form";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { useEffect } from "react";
import ShoppingCartItemsAccordion from "./ShoppingCartItemsAccordion";

export default function OrderSummary({
  orderButtonHandler,
  form,
}: {
  orderButtonHandler: () => void;
  form: UseFormReturn<CheckoutData>;
}) {
  const { cart } = useShoppingCart();

  const totalPrice = cart.reduce((sum, cartItem) => {
    return sum + cartItem.item.price * cartItem.item.quantity;
  }, 0);

  const freeDelivery = totalPrice >= 55;

  useEffect(() => {
    form.setValue(
      "totalToPay",
      (totalPrice + (freeDelivery ? 0 : 9.99)).toFixed(2)
    );
  }, []);

  const formValues = form.watch();
  const deliveryMethod = formValues.deliveryMethod;
  const formErrors = form.formState.errors;

  const isFormValid = (() => {
    if (Object.keys(formErrors).length > 0) {
      return false;
    }

    const basicFieldsValid = !!(
      formValues.firstName &&
      formValues.lastName &&
      formValues.email &&
      formValues.phoneNumber &&
      formValues.paymentMethod
    );

    if (!basicFieldsValid) return false;

    if (deliveryMethod === "courier") {
      const addressValid = !!(
        formValues.address?.city &&
        formValues.address?.postalCode &&
        formValues.address?.street &&
        formValues.address?.buildingNumber
      );
      return addressValid;
    }

    if (deliveryMethod === "parcelLocker") {
      return !!formValues.pickupPoint;
    }

    return true;
  })();

  return (
    <section className="w-fit overflow-hidden max-w-full">
      <ShoppingCartItemsAccordion cart={cart} />
      <section className="text-lg border-t-2 pt-4 mb-4">
        <p className={`${freeDelivery ? "underline decoration-success" : ""} `}>
          Koszty wysyłki: {freeDelivery ? "0,00 zł" : "9,99 zł"}
        </p>
        {!freeDelivery && (
          <p>
            Do darmowej dostawy brakuje{" "}
            {new Intl.NumberFormat("pl-PL", {
              style: "currency",
              currency: "PLN",
              minimumFractionDigits: 2,
            }).format(55 - totalPrice)}
          </p>
        )}
        <p className="font-medium">
          Do zapłaty:{" "}
          {new Intl.NumberFormat("pl-PL", {
            style: "currency",
            currency: "PLN",
            minimumFractionDigits: 2,
          }).format(totalPrice + (freeDelivery ? 0 : 9.99))}
        </p>
      </section>
      <Button
        className="text-xl px-8 py-6 mb-2 w-full max-w-[300px]"
        variant={"important"}
        disabled={!isFormValid}
        onClick={orderButtonHandler}
      >
        Zamawiam i płacę
      </Button>
      <ShippingInfo />
    </section>
  );
}
