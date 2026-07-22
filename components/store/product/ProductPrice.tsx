import { TagIcon } from "lucide-react";
import { formatPLN, getDiscountInfo } from "@/helpers/prices";
import { cn } from "@/lib/utils";

type ProductPriceProps = {
  currentPrice: number;
  reference?: number | null;
  variant: "listing" | "page";
  className?: string;
};

export default function ProductPrice({
  currentPrice,
  reference = null,
  variant,
  className,
}: ProductPriceProps) {
  const discount = getDiscountInfo(currentPrice, reference);

  if (!discount) {
    const priceEl = (
      <p
        className={cn(
          variant === "page"
            ? "text-xl md:text-2xl font-medium flex items-center gap-2"
            : "text-lg md:text-xl font-medium",
        )}
      >
        {variant === "page" && (
          <TagIcon className="text-success size-5 md:size-6" />
        )}
        {formatPLN(currentPrice)}
      </p>
    );

    return <div className={className}>{priceEl}</div>;
  }

  const pricesBlock = (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-2 flex-wrap">
        <p
          className={cn(
            "line-through text-muted-foreground",
            variant === "page"
              ? "text-base md:text-lg"
              : "text-sm md:text-base",
          )}
        >
          {formatPLN(discount.oldPrice)}
        </p>
        <p
          className={cn(
            "font-medium underline decoration-success",
            variant === "page" ? "text-xl md:text-2xl" : "text-lg md:text-xl",
          )}
        >
          {formatPLN(discount.newPrice)}
        </p>
        <span className="border-2 border-success rounded-xs px-1.5 bg-card py-0.5 text-sm font-medium whitespace-nowrap">
          -{discount.percent}%
        </span>
      </div>
      <p
        className={cn(
          "text-muted-foreground",
          variant === "page" ? "text-xs md:text-sm" : "text-[10px] xs:text-xs",
        )}
      >
        Najniższa cena z 30 dni
      </p>
    </div>
  );

  return <div className={className}>{pricesBlock}</div>;
}
