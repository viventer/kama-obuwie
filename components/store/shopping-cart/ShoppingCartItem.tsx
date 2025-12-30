"use client";

import type { ShoppingCartItemType } from "@/firebase/schemas/shoppingCartSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import Image from "next/image";
import IconButton from "@/components/adminPanel/global/IconButton";
import { EditIcon, InfoIcon, TrashIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import EditCartItemDialog from "./EditCartItemDialog";
import LinkText from "@/components/adminPanel/global/LinkText";

interface ShoppingCartItemProps {
  cartItem: ShoppingCartItemType;
  offerData?: OfferWithId;
  onRemove?: (itemId: string, itemName: string) => void;
}

export default function ShoppingCartItem({
  cartItem,
  offerData,
  onRemove,
}: ShoppingCartItemProps) {
  const handleRemove = () => {
    const itemName = `${cartItem.item.categoryName} ${
      cartItem.item.brand || ""
    }`;
    if (onRemove) {
      onRemove(cartItem.id, itemName);
    }
  };

  const isAvailable = cartItem.item.isAvailable;

  return (
    <Card
      className={`p-2 sm:p-4 gap-4 ${
        isAvailable ? "" : "border-destructive/50"
      }`}
    >
      {!isAvailable && (
        <div className="flex items-center gap-2">
          <InfoIcon className="size-5 text-destructive" />
          <p>Produkt niedostępny</p>
        </div>
      )}
      <CardContent
        className={`px-2  ${isAvailable ? "" : "border-destructive/50"}`}
      >
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-20 sm:w-24 aspect-square relative">
            <Image
              src={cartItem.item.thumbnailUrl}
              alt={`${cartItem.item.brand || ""} ${cartItem.item.categoryName}`}
              fill
              className={`object-contain rounded-xl bg-white`}
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <LinkText
              href={`/product/${cartItem.item.productId}?colorVariantName=${cartItem.item.formattedMainColor}`}
              target="_blank"
            >
              <h3
                className={`font-medium text-lg sm:text-xl truncate text-card-foreground capitalize`}
              >
                {cartItem.item.categoryName} {cartItem.item.brand}
              </h3>
            </LinkText>
            <p className="text-text text-base sm:text-lg mb-1">
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
                minimumFractionDigits: 2,
              }).format(cartItem.item.price)}
            </p>
            <div className="flex items-center gap-x-4 text-muted-foreground text-sm sm:text-base flex-wrap">
              <span className="whitespace-nowrap">r. {cartItem.item.size}</span>
              <span
                className={`whitespace-nowrap ${
                  isAvailable ? "" : "text-destructive"
                }`}
              >
                ilość: {cartItem.item.quantity}
              </span>
              <span className="break-words">
                {cartItem.item.formattedMainColor}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 flex-col xs:flex-row ">
            {offerData && cartItem.item.isAvailable && (
              <EditCartItemDialog
                cartItem={cartItem}
                availability={offerData.availability}
              >
                <IconButton title="Edytuj">
                  <EditIcon className="size-5 sm:size-6" />
                </IconButton>
              </EditCartItemDialog>
            )}

            {onRemove && (
              <IconButton
                title="Usuń z koszyka"
                className="text-destructive hover:text-text"
                onClick={handleRemove}
              >
                <TrashIcon className="size-5 sm:size-6" />
              </IconButton>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
