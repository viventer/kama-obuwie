"use client";

import Image from "next/image";
import Link from "next/link";
import type { RankedSearchHit } from "@/lib/search/ranking";
import { formatPLN } from "@/helpers/prices";

export default function SearchResultRow({
  product,
  onNavigate,
}: {
  product: RankedSearchHit;
  onNavigate?: () => void;
}) {
  const href = `/product/${product.id}?colorVariantName=${encodeURIComponent(product.colorVariantName)}`;
  const categoryLabel =
    product.categoryDisplayName || product.categoryName || "";
  const hasBrand = Boolean(
    product.brand && product.brand.trim() && product.brand !== "bez marki",
  );
  const titleLabel = hasBrand ? product.brand! : categoryLabel;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className="flex items-center gap-3 px-3 py-2 hover:bg-foreground/5 transition-colors"
    >
      <div className="relative size-14 shrink-0 bg-white rounded-xs overflow-hidden border border-border">
        {product.thumbnailUrl ? (
          <Image
            src={product.thumbnailUrl}
            alt={product.title || titleLabel}
            fill
            className="object-contain"
            sizes="56px"
          />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-base truncate capitalize">
          {titleLabel}
        </p>
        {hasBrand && categoryLabel ? (
          <p className="text-sm text-muted-foreground truncate">
            {categoryLabel}
          </p>
        ) : null}
      </div>
      <p className="font-bold text-base shrink-0 tabular-nums">
        {formatPLN(Number(product.price))}
      </p>
    </Link>
  );
}
