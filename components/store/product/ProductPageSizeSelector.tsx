"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Availability } from "@/firebase/schemas/offersSchemas";
import { cn } from "@/lib/utils";
import { XIcon } from "lucide-react";

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

  return (
    <article className="mb-2">
      <Tabs
        value={selectedSize}
        onValueChange={(value) => {
          if (isAvailable(value)) {
            onSizeChange(value);
          }
        }}
        className="w-full"
      >
        <TabsList className="flex gap-2 h-fit bg-transparent flex-wrap justify-start">
          {availableSizes.map((size) => {
            const available = isAvailable(size);
            const isSelected = selectedSize === size;

            return (
              <TabsTrigger
                key={size}
                value={size}
                disabled={!available}
                className={`
                  p-3 w-10 h-10 max-w-10 md:w-12 md:h-12 md:max-w-12 aspect-square
                  data-[state=active]:bg-primary 
                   rounded-lg
                  transition-all font-medium
                  relative
                  data-[state=inactive]:text-text
                  data-[state=active]:text-white
                  text-base bg-secondary/15 hover:bg-primary/30 shadow-none
                  border-none
                  ${available ? "" : " cursor-not-allowed !opacity-30"}
                `}
              >
                <span
                  className={cn(
                    "text-sm",
                    !available && "line-through decoration-2",
                  )}
                >
                  {size}
                </span>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
      {/* Zawsze wyświetlana informacja o wybranym rozmiarze */}
      <div className="text-sm text-muted-foreground mt-1">
        {selectedSize ? (
          <>
            Wybrano rozmiar:{" "}
            <span className="font-medium text-text">{selectedSize}</span>
            {(() => {
              const available = isAvailable(selectedSize);
              const sizeAvailability = availability[selectedSize];

              if (available && sizeAvailability) {
                return (
                  <span className="ml-2 text-success font-medium">
                    (dostępne: {sizeAvailability.value})
                  </span>
                );
              } else {
                return (
                  <span className="ml-2 text-destructive">(niedostępne)</span>
                );
              }
            })()}
          </>
        ) : (
          <span className="text-muted-foreground/70">Nie wybrano rozmiaru</span>
        )}
      </div>
    </article>
  );
}
