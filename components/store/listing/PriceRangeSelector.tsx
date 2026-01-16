import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PriceRange } from "@/helpers/prices";

export default function PriceRangeSelector({
  availablePriceRanges,
  selectedPriceRange,
  onChange,
}: {
  availablePriceRanges: PriceRange[];
  selectedPriceRange: PriceRange[];
  onChange: (prices: PriceRange[]) => void;
}) {
  const handleValueChange = (values: string[]) => {
    const selectedRanges = values.map((value) => {
      const [from, to] = value.split("-");
      return {
        from: Number.parseFloat(from),
        to: to === "Infinity" ? Infinity : Number.parseFloat(to),
      };
    });
    onChange(selectedRanges);
  };

  return (
    <article className="hidden md:block">
      <h3 className="font-bold md:text-lg mb-1">Wybierz przedział cenowy</h3>
      <ToggleGroup
        value={selectedPriceRange.map((range) => `${range.from}-${range.to}`)}
        onValueChange={handleValueChange}
        type="multiple"
        variant="outline"
        size="sm"
        className="flex justify-start gap-2 ml-1 flex-wrap"
      >
        {availablePriceRanges.map((priceRange) => (
          <ToggleGroupItem
            key={`${priceRange.from}-${priceRange.to}`}
            value={`${priceRange.from}-${priceRange.to}`}
            className="text-base h-11 data-[state=on]:bg-primary border-2 hover:bg-primary/50 shadow-none data-[state=on]:border-primary data-[state=off]:border-secondary/25 px-4 w-fit"
          >
            {priceRange.from === 0
              ? `Do ${priceRange.to} zł`
              : priceRange.to === Infinity
                ? `Od ${priceRange.from} zł`
                : `${priceRange.from} - ${priceRange.to} zł`}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </article>
  );
}
