"use client";

import Image from "next/image";
import { ImageIcon } from "lucide-react";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { extractSizeFromTitle } from "../../../helpers/extractSizeFromTitle";
import { cn } from "@/lib/utils";

interface OrderLineItemDisplayProps {
  lineItems: Order["lineItems"];
  className?: string;
}

export function OrderLineItemDisplay({
  lineItems,
  className,
}: OrderLineItemDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {lineItems.map((item, index) => {
        const size = extractSizeFromTitle(item.offer.name || "");

        return (
          <div
            key={item.id || index}
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
                {item.offer.signature}
                {size && (
                  <span className="ml-2 text-xs bg-primary/25 px-2 py-1 rounded">
                    {size}
                  </span>
                )}
              </p>
            </div>

            <div className="text-right text-sm">
              <div className="font-medium">
                {item.quantity}x {item.price.amount} {item.price.currency}
              </div>
              {item.originalPrice.amount !== item.price.amount && (
                <div className="text-xs text-foreground/85 line-through">
                  {item.originalPrice.amount} {item.originalPrice.currency}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
