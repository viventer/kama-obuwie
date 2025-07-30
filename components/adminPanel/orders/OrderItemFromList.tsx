"use client";

import { Order } from "@/firebase/schemas/ordersSchemas";
import { extractSizeFromTitle } from "@/helpers/extractSizeFromTitle";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

export default function OrderItemFromList({
  item,
  withPrice,
  refund,
}: {
  item: Order["lineItems"][number];
  withPrice: boolean;
  refund?: Order["refund"];
}) {
  const size = extractSizeFromTitle(item.offer.name || "");
  const amountPaid = Number(item.price.amount) * item.quantity;
  const [priceAfterRefund, setPriceAfterRefund] = useState(amountPaid);
  const [refundedAmount, setRefundedAmount] = useState(0);

  useEffect(() => {
    if (refund && refund.lineItems) {
      const refundedItem = refund.lineItems.find(
        (refunded) => refunded.id === item.id
      );
      const refunded = Number(refundedItem?.value?.amount) || 0;

      setRefundedAmount(refunded);

      if (refundedItem) {
        setPriceAfterRefund(amountPaid - refunded);
      }
    }
  }, []);

  return (
    <div
      key={item.id}
      className="flex items-center gap-3 p-2 border rounded-md"
    >
      <div className="w-12 h-12 bg-primary/25 rounded overflow-hidden flex-shrink-0">
        {item.offer.thumbnail ? (
          <Image
            src={item.offer.thumbnail}
            alt="Product"
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        ) : (
          <ImageIcon className="w-full h-full p-2" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm truncate">
          <span
            className={`${
              priceAfterRefund <= 0 ? "line-through text-destructive" : ""
            }`}
          >
            {item.offer.signature}
          </span>
          {size && (
            <span className="ml-2 text-xs bg-primary/25 px-2 py-1 rounded">
              {size}
            </span>
          )}
        </p>
      </div>

      {withPrice && (
        <div className="text-right text-sm">
          <div>
            {item.quantity}x {item.price.amount} {item.price.currency}
          </div>
          {item.originalPrice.amount !== item.price.amount && (
            <div className="text-xs text-foreground/85 line-through">
              {item.originalPrice.amount} {item.originalPrice.currency}
            </div>
          )}
          {refundedAmount > 0 && (
            <div className="text-xs opacity-80">
              Zwrócono: {refundedAmount} {item.price.currency}
            </div>
          )}
          <div>
            <span className="font-medium">Suma:</span>{" "}
            <span className="text-foreground">
              {priceAfterRefund} {item.price.currency}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
