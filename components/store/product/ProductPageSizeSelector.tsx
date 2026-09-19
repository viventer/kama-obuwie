"use client";

import FilterChipGroup from "@/components/store/listing/filters/FilterChipGroup";
import { Availability } from "@/firebase/schemas/offersSchemas";

interface ProductPageSizeSelectorProps {
  availability: Record<string, Availability>;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

export default function ProductPageSizeSelector({
  availability,
  selectedSize,
  onSizeChange,
}: ProductPageSizeSelectorProps) {
  const availableSizes = Object.keys(availability).sort();

  if (availableSizes.length === 0) {
    return null;
  }

  const isAvailable = (size: string): boolean => {
    const sizeAvailability = availability[size];
    return (
      sizeAvailability &&
      sizeAvailability.value !== "0" &&
      sizeAvailability.value !== ""
    );
  };

  const selectedAvailability = selectedSize
    ? availability[selectedSize]
    : undefined;
  const selectedIsAvailable = selectedSize ? isAvailable(selectedSize) : false;

  return (
    <article className="mb-2">
      <FilterChipGroup
        type="single"
        options={availableSizes.map((size) => ({
          value: size,
          label: size,
          disabled: !isAvailable(size),
        }))}
        selected={selectedSize}
        onChange={onSizeChange}
        itemClassName="size-12 min-w-12 px-0"
      />
      <div className="text-sm text-muted-foreground mt-1">
        {selectedSize ? (
          <>
            Wybrano rozmiar:{" "}
            <span className="font-medium text-text">{selectedSize}</span>
            {selectedIsAvailable && selectedAvailability ? (
              <span className="ml-2 text-success font-medium">
                (dostępne: {selectedAvailability.value})
              </span>
            ) : (
              <span className="ml-2 text-destructive">(niedostępne)</span>
            )}
          </>
        ) : (
          <span className="text-muted-foreground/70">Nie wybrano rozmiaru</span>
        )}
      </div>
    </article>
  );
}
