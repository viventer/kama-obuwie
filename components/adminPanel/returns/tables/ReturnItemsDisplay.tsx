"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { cn } from "@/lib/utils";
import ReturnItemFromList from "./ReturnItemFromList";

interface ReturnItemsDisplayProps {
  items: AllegroReturn["items"];
  className?: string;
}

export function ReturnItemsDisplay({
  items,
  className,
}: ReturnItemsDisplayProps) {
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {items.map((item, index) => (
        <ReturnItemFromList key={`${item.offerId}-${index}`} item={item} />
      ))}
    </div>
  );
}
