import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, cubicBezier, motion } from "framer-motion";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";
import SizeChip from "@/components/store/home/SizeChip";
import { buildProductPagePath } from "@/helpers/productUrl";
import { cn } from "@/lib/utils";

const hoverDetailsTransition = {
  duration: 0.25,
  ease: cubicBezier(0.22, 1, 0.36, 1),
};

const MAX_VISIBLE_SWATCHES = 5;
const MANY_SIZES_THRESHOLD = 7;

const getInStockSizes = (
  availability: ProductListingData["availability"],
): string[] =>
  Object.entries(availability)
    .filter(([, quantity]) => quantity > 0)
    .map(([size]) => size)
    .sort((a, b) => Number(a) - Number(b));

export default function ProductFromListHoverDetails({
  isVisible,
  product,
  variants,
  previewVariant,
  ownHref,
  onHoverVariant,
}: {
  isVisible: boolean;
  product: ProductListingData;
  variants?: ProductListingData[];
  previewVariant: ProductListingData;
  ownHref: string;
  onHoverVariant: (colorVariantName: string) => void;
}) {
  const swatchOptions =
    variants?.filter(
      (variant) =>
        variant.isActive ||
        variant.colorVariantName === product.colorVariantName,
    ) ?? [];
  const showSwatches = swatchOptions.length > 1;

  const currentSwatch =
    swatchOptions.find(
      (variant) => variant.colorVariantName === product.colorVariantName,
    ) ?? product;
  const otherSwatches = swatchOptions.filter(
    (variant) => variant.colorVariantName !== product.colorVariantName,
  );
  const orderedSwatches = showSwatches ? [currentSwatch, ...otherSwatches] : [];
  const visibleSwatches = orderedSwatches.slice(0, MAX_VISIBLE_SWATCHES);
  const hiddenSwatchCount = orderedSwatches.length - visibleSwatches.length;

  const inStockSizes = getInStockSizes(previewVariant.availability);
  const hasHoverDetails = inStockSizes.length > 0 || showSwatches;

  return (
    <AnimatePresence initial={false}>
      {isVisible && hasHoverDetails && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={hoverDetailsTransition}
          className="absolute bottom-full inset-x-0 bg-card/30 px-2 xs:px-3 overflow-hidden will-change-[height,opacity]"
        >
          <div className="py-1.5 flex flex-col gap-1.5">
            {showSwatches && (
              <div className="flex items-center gap-1.5">
                {visibleSwatches.map((variant) => {
                  const isPreviewed =
                    variant.colorVariantName ===
                    previewVariant.colorVariantName;

                  return (
                    <Link
                      key={variant.colorVariantName}
                      href={buildProductPagePath({
                        id: variant.id,
                        colorVariantName: variant.colorVariantName,
                      })}
                      onMouseEnter={() =>
                        onHoverVariant(variant.colorVariantName)
                      }
                      className="max-w-fit"
                    >
                      <div
                        className={cn(
                          "relative after:rounded-b-xs after:absolute after:left-0 after:right-0 after:bottom-0 after:h-0.5 after:bg-brand after:origin-left after:scale-y-0 after:transition-transform after:duration-200 transition-all duration-200",
                          isPreviewed ? "after:scale-y-100" : "brightness-75",
                        )}
                      >
                        <Image
                          src={variant.thumbnailUrl}
                          alt={`Wariant ${variant.colorVariantName}`}
                          width={40}
                          height={40}
                          className="object-contain size-12 aspect-square bg-white rounded-xs"
                        />
                      </div>
                    </Link>
                  );
                })}
                {hiddenSwatchCount > 0 && (
                  <Link
                    href={ownHref}
                    className="flex items-center justify-center size-8 bg-foreground/10 rounded-xs text-xs font-medium text-muted-foreground hover:text-text"
                  >
                    +{hiddenSwatchCount}
                  </Link>
                )}
              </div>
            )}

            {inStockSizes.length > MANY_SIZES_THRESHOLD ? (
              <p className="text-sm text-muted-foreground">
                Dostępny w wielu rozmiarach
              </p>
            ) : inStockSizes.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {inStockSizes.map((size) => (
                  <SizeChip key={size} label={size} />
                ))}
              </div>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
