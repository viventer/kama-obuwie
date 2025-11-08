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

export default function OrderSummary() {
  const { cart, isLoading } = useShoppingCart();

  const totalPrice = cart.reduce((sum, cartItem) => {
    return sum + cartItem.item.price * cartItem.item.quantity;
  }, 0);

  const freeDelivery = totalPrice >= 55;

  return (
    <section className="w-fit overflow-hidden">
      <Accordion type="single" collapsible>
        <AccordionItem value="order-summary" className="max-w-xl w-xl">
          <AccordionTrigger className="cursor-pointer">
            <h2 className="text-xl">Podsumowanie zamówienia</h2>
          </AccordionTrigger>
          <AccordionContent>
            <article className="space-y-4 max-w-xl">
              {cart.map((cartItem) => (
                <ShoppingCartItem key={cartItem.id} cartItem={cartItem} />
              ))}
            </article>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      <section className="text-lg border-t-2 pt-4 mb-4">
        <p className={`${freeDelivery ? "underline decoration-success" : ""} `}>
          Koszty wysyłki: {freeDelivery ? "0,00 zł" : "9,99 zł"}
        </p>
        {!freeDelivery && (
          <p>Do darmowej dostawy brakuje {55 - totalPrice} zł</p>
        )}
        <p>
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
      >
        Zamawiam i płacę
      </Button>
      <ShippingInfo />
    </section>
  );
}
