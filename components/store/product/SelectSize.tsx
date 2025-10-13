"use client";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Availability } from "@/firebase/schemas/offersSchemas";

interface SelectSizeProps {
  availability: Record<string, Availability>;
  selectedSize: string;
  onSizeChange: (size: string) => void;
}

export default function SelectSize({
  availability,
  selectedSize,
  onSizeChange,
}: SelectSizeProps) {
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
    <article>
      <h3 className="text-lg mb-1">Rozmiar</h3>
      <Tabs
        value={selectedSize}
        onValueChange={(value) => {
          if (isAvailable(value)) {
            onSizeChange(value);
          }
        }}
        className="w-full"
      >
        <TabsList className="flex gap-2 h-auto bg-transparent flex-wrap">
          {availableSizes.map((size) => {
            const available = isAvailable(size);
            const isSelected = selectedSize === size;

            return (
              <TabsTrigger
                key={size}
                value={size}
                disabled={!available}
                className={`
                  p-3 h-auto min-w-[3rem] aspect-square
                  data-[state=active]:bg-transparent data-[state=active]:shadow-none 
                  bg-transparent rounded-lg
                  transition-all font-medium
                  hover:bg-transparent
                  relative
                  border-1 
                  border-text/50
                  ${
                    available
                      ? isSelected
                        ? "border-2 border-success brightness-150"
                        : "  hover:border-text"
                      : "border-destructive border-2 cursor-not-allowed opacity-50"
                  }
                `}
              >
                <span className="text-sm">{size}</span>
                {isSelected && available && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-success rounded-full"></div>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Zawsze wyświetlana informacja o wybranym rozmiarze */}
        <div className="text-sm text-muted-foreground min-h-[1.25rem]">
          {selectedSize ? (
            <>
              Wybrano rozmiar:{" "}
              <span className="font-medium text-text">{selectedSize}</span>
              {(() => {
                const available = isAvailable(selectedSize);
                const sizeAvailability = availability[selectedSize];

                if (available && sizeAvailability) {
                  return (
                    <span className="ml-2 text-success brightness-150">
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
            <span className="text-muted-foreground/70">
              Nie wybrano rozmiaru
            </span>
          )}
        </div>
      </Tabs>
    </article>
  );
}
