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
            className="text-base hover:text-text data-[state=inactive]:text-text
                  data-[state=active]:text-white bg-secondary/20 size-10 min-w-10 md:size-11 data-[state=on]:bg-primary border-none hover:bg-primary/30 shadow-none cursor-pointer"
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
