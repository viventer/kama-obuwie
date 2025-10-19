"use client";

import { useShoppingCart } from "@/app/providers/ShoppingCartProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";

export default function ShoppingCartPreview() {
  const { cart, isLoading } = useShoppingCart();

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-center">Ładowanie...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground text-center">
          Twój koszyk jest pusty
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[500px] min-w-[300px] max-w-full">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar">
        {cart.map((cartItem) => {
          const { item } = cartItem;
          const totalItemPrice = item.price * item.quantity;

          return (
            <div
              key={cartItem.id}
              className="flex gap-4 pb-3 border-b border-border last:border-b-0 items-center"
            >
              <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-md overflow-hidden">
                <Image
                  src={item.thumbnailUrl}
                  alt={`${item.brand || ""} ${item.categoryName}`}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground line-clamp-1 capitalize">
                  {item.categoryName} {item.brand}
                </div>
                <div className="flex items-center gap-x-4 text-muted-foreground text-sm flex-wrap">
                  <span className="whitespace-nowrap">
                    r. {cartItem.item.size}
                  </span>
                  <span className="whitespace-nowrap">
                    ilość: {cartItem.item.quantity}
                  </span>
                  <span className="break-words">
                    {cartItem.item.formattedMainColor}
                  </span>
                </div>
                <div className="text-xs text-muted-foreground"></div>
                <div className="text-sm font-semibold text-foreground mt-1">
                  {new Intl.NumberFormat("pl-PL", {
                    style: "currency",
                    currency: "PLN",
                    minimumFractionDigits: 2,
                  }).format(totalItemPrice)}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-4 border-t border-border">
        <Link href="/shopping-cart" className="block">
          <Button variant="important" className="w-full">
            Przejdź do koszyka
          </Button>
        </Link>
      </div>
    </div>
  );
}
