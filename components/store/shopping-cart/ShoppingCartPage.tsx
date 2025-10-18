"use client";

import { useShoppingCart } from "@/hooks/useShoppingCart";
import { useToast } from "@/hooks/useToast";
import Image from "next/image";
import IconButton from "@/components/adminPanel/global/IconButton";
import { EditIcon, TrashIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";
import { useEffect } from "react";
import Loader from "@/components/adminPanel/global/Loader";

export default function ShoppingCartPage() {
  const { cart, removeFromCart, isLoading } = useShoppingCart();
  const { showToast } = useToast();

  const handleRemoveItem = (itemId: string, itemName: string) => {
    removeFromCart(itemId);
    showToast(`Usunięto ${itemName} z koszyka`, "success");
  };

  if (isLoading) {
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
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6 text-foreground">Koszyk</h1>

      <div className="space-y-4">
        {cart.map((cartItem) => (
          <Card key={cartItem.id}>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                {/* Product Image */}
                <div className="flex-shrink-0 w-20 h-20 relative">
                  <Image
                    src={cartItem.item.thumbnailUrl}
                    alt={`${cartItem.item.brand || ""} ${
                      cartItem.item.categoryName
                    }`}
                    fill
                    className="object-cover rounded"
                    sizes="80px"
                  />
                </div>

                {/* Product Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg truncate text-card-foreground">
                    {cartItem.item.categoryName} {cartItem.item.brand}
                  </h3>
                  <p className="text-sm text-card-foreground mb-1">
                    {new Intl.NumberFormat("pl-PL", {
                      style: "currency",
                      currency: "PLN",
                      minimumFractionDigits: 2,
                    }).format(cartItem.item.price)}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>r. {cartItem.item.size}</span>
                    <span>ilość: {cartItem.item.quantity}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <IconButton
                    title="Edytuj"
                    className="text-accent hover:text-accent/80 p-2"
                  >
                    <EditIcon size={20} />
                  </IconButton>

                  <IconButton
                    title="Usuń z koszyka"
                    className="text-destructive hover:text-destructive/80 p-2"
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
