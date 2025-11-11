"use client";

import { useShoppingCart } from "@/app/providers/ShoppingCartProvider";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import ShoppingCartPreviewItem from "./ShoppingCartPreviewItem";

export default function ShoppingCartPreview() {
  const { cart, isLoading } = useShoppingCart();

  if (isLoading) {
    return (
      <div className="p-4">
        <p className="text-center min-w-[200px]">Ładowanie...</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="p-4">
        <p className="text-center min-w-[200px]">Twój koszyk jest pusty</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col max-h-[500px] min-w-[300px] max-w-full">
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-3 scrollbar">
        {cart.map((cartItem) => {
          const { item } = cartItem;

          return <ShoppingCartPreviewItem key={cartItem.id} item={item} />;
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
