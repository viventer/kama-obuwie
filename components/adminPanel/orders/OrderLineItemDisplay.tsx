"use client";

import { Order } from "@/firebase/schemas/ordersSchemas";
import { cn } from "@/lib/utils";
import OrderItemFromList from "./OrderItemFromList";

interface OrderLineItemDisplayProps {
  lineItems: Order["lineItems"];
  className?: string;
  withPrice?: boolean;
}

export function OrderLineItemDisplay({
  lineItems,
  className,
  withPrice = true,
}: OrderLineItemDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {lineItems.map((item, index) => (
        <OrderItemFromList
          key={item.id || index}
          item={item}
          withPrice={withPrice}
        />
      ))}
    </div>
  );
}
