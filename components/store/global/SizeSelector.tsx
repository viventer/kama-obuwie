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
    <article className="max-w-[90vw] md:max-w-[700px]">
      <h3 className="font-bold md:text-lg text-base mb-1">Wybierz rozmiar</h3>
      <ToggleGroup
        type="multiple"
        variant="outline"
        size="sm"
        className="flex justify-start gap-2 ml-1 md:flex-wrap max-h-12 md:max-h-24 overflow-auto pb-2 md:pb-0 scrollbar-thin"
      >
        {availableSizes.map((size) => (
          <ToggleGroupItem
            key={size}
            value={size}
            aria-label={`Toggle size ${size}`}
            className="text-base size-10 min-w-10 md:size-11 data-[state=on]:bg-primary border-2 hover:bg-primary/50 shadow-none data-[state=on]:border-none data-[state=off]:border-secondary/25"
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
