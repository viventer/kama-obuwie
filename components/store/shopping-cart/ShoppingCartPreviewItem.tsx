import { ShoppingCartItemType } from "@/firebase/schemas/shoppingCartSchemas";
import Image from "next/image";

export default function ShoppingCartPreviewItem({
  item,
}: {
  item: ShoppingCartItemType["item"];
}) {
  const totalItemPrice = item.price * item.quantity;

  return (
    <div className="flex gap-4 pb-3 border-b border-border last:border-b-0 items-center">
      <div className="relative w-20 h-20 flex-shrink-0 bg-muted rounded-xs overflow-hidden">
        <Image
          src={item.thumbnailUrl}
          alt={`${item.brand || ""} ${item.categoryName}`}
          fill
          className="object-cover bg-white"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-foreground line-clamp-1 capitalize">
          {item.categoryName} {item.brand}
        </div>
        <div className="flex items-center gap-x-4 text-muted-foreground text-sm flex-wrap">
          <span className="whitespace-nowrap">r. {item.size}</span>
          <span className="whitespace-nowrap">ilość: {item.quantity}</span>
          <span className="break-words">{item.formattedMainColor}</span>
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
}
