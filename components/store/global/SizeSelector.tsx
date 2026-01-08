import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function SizeSelector({
  availableSizes,
  selectedSizes,
  onChange,
}: {
  availableSizes: string[];
  selectedSizes: string[];
  onChange: (sizes: string[]) => void;
}) {
  return (
    <article>
      <h3 className="font-bold text-lg mb-1">Wybierz rozmiar</h3>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        className="flex justify-start gap-2 ml-1"
      >
        {availableSizes.map((size) => (
          <ToggleGroupItem
            key={size}
            value={size}
            aria-label={`Toggle size ${size}`}
            className="text-base size-11 data-[state=on]:bg-primary border-2 hover:bg-primary/50 shadow-none data-[state=on]:border-none data-[state=off]:border-secondary/25"
            onClick={() => {
              if (selectedSizes.includes(size)) {
                onChange(selectedSizes.filter((s) => s !== size));
              } else {
                onChange([...selectedSizes, size]);
              }
            }}
          >
            {size}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </article>
  );
}
