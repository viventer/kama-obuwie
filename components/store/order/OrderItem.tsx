import { Card, CardContent } from "@/components/ui/card";
import { OrderItemType } from "@/firebase/schemas/ordersSchemas";
import Image from "next/image";

export default function OrderItem({ itemData }: { itemData: OrderItemType }) {
  return (
    <Card className="p-2 sm:p-4">
      <CardContent className="px-2">
        <div className="flex items-center gap-4">
          <div className="flex-shrink-0 w-20 sm:w-24 aspect-square relative">
            <Image
              src={itemData.offer.thumbnail}
              alt={`${itemData.offer.signature}`}
              fill
              className="object-contain rounded-xs bg-white"
              sizes="80px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-lg sm:text-xl truncate text-card-foreground capitalize">
              {itemData.offer.signature}
            </h3>
            <p className="text-text text-base sm:text-lg mb-1">
              {new Intl.NumberFormat("pl-PL", {
                style: "currency",
                currency: "PLN",
                minimumFractionDigits: 2,
              }).format(parseFloat(itemData.price.amount))}
            </p>
            <div className="flex items-center gap-x-4 text-muted-foreground text-sm sm:text-base flex-wrap">
              <span className="whitespace-nowrap">
                r. {itemData.offer.size}
              </span>
              <span className="whitespace-nowrap">
                ilość: {itemData.quantity}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
