import { PriceRange } from "@/helpers/prices";
import SizeSelector from "../global/SizeSelector";
import PriceRangeSelector from "./PriceRangeSelector";

export default function ListingFilters({
  selectedSizes,
  availableSizes,
  sizesOnChange,
  selectedPriceRange,
  pricesOnChange,
  availablePriceRanges,
}: {
  selectedSizes: string[];
  availableSizes: string[];
  sizesOnChange: (sizes: string[]) => void;
  selectedPriceRange: PriceRange[];
  pricesOnChange: (prices: PriceRange[]) => void;
  availablePriceRanges: PriceRange[];
}) {
  return (
    <section className="mb-4 md:mb-6 flex flex-col gap-4">
      {availableSizes.length > 0 && (
        <SizeSelector
          selectedSizes={selectedSizes}
          availableSizes={availableSizes}
          onChange={sizesOnChange}
        />
      )}
      {availablePriceRanges.length > 0 && (
        <PriceRangeSelector
          availablePriceRanges={availablePriceRanges}
          selectedPriceRange={selectedPriceRange}
          onChange={pricesOnChange}
        />
      )}
    </section>
  );
}
