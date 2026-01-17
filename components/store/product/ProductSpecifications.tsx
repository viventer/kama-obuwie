"use client";

import ExpandableElement from "@/components/ui/ExpandableElement";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { cn } from "@/lib/utils";

export default function ProductSpecifications({
  productParameters,
  className,
  productBrand,
}: {
  productParameters: ProductWithId["parameters"];
  className?: string;
  productBrand?: string;
}) {
  const renderParameterValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "boolean") {
      return value ? "Tak" : "Nie";
    }
    return String(value);
  };

  const allParameters = [
    ...Object.entries(productParameters.required || {}),
    ...Object.entries(productParameters.optional || {}),
  ];

  const filteredParameters = allParameters.filter(([_, value]) => {
    if (!value) return false;
    if (
      typeof value === "string" &&
      ["bez", "inna", "inne"].some((s) => value.toLowerCase().includes(s))
    ) {
      return false;
    }
    return true;
  });

  if (productBrand) {
    filteredParameters.unshift(["Marka", productBrand]);
  }

  if (allParameters.length === 0) {
    return (
      <article
        className={cn(
          "flex flex-col gap-2 border-secondary border-1 px-4 py-3 rounded-sm w-full",
          className,
        )}
      >
        <p className="text-muted-foreground text-sm">
          Brak specyfikacji produktu
        </p>
      </article>
    );
  }

  return (
    <article className={className}>
      <h2 className="text-lg md:text-xl font-medium mb-1">Specyfikacja</h2>
      <ExpandableElement
        collapsedHeight={96}
        expandText="Rozwiń specyfikację"
        collapseText="Zwiń specyfikację"
      >
        <ul className="flex flex-col gap-2">
          {filteredParameters.map(([key, value]) => (
            <li
              key={key}
              className="flex justify-between items-start border-b border-secondary/50 pb-2 first:border-t first:pt-2 last:border-b-0 last:pb-0"
            >
              <span className="font-medium capitalize min-w-0 flex-1 mr-4">
                {key.replace(/([A-Z])/g, " $1").trim()}
              </span>
              <span className="text-right min-w-0 flex-1">
                {renderParameterValue(value)}
              </span>
            </li>
          ))}
        </ul>
      </ExpandableElement>
    </article>
  );
}
