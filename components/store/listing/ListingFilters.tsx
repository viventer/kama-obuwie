import SizeSelector from "../global/SizeSelector";
import { PriceRange } from "./CategoryProductsListing";

export default function ListingFilters({
  selectedSizes,
  availableSizes,
  sizesOnChange,
  selectedPrices,
  pricesOnChange,
}: {
  selectedSizes: string[];
  availableSizes: string[];
  sizesOnChange: (sizes: string[]) => void;
  selectedPrices: PriceRange[];
  pricesOnChange: (prices: PriceRange[]) => void;
}) {
  return (
    <section className="mb-6">
      <SizeSelector
        selectedSizes={selectedSizes}
        availableSizes={availableSizes}
        onChange={sizesOnChange}
      />
    </section>
  );
}
