import { ProductWithId } from "@/firebase/schemas/productsSchemas";

export default function ProductSpecifications({
  productParameters,
}: {
  productParameters: ProductWithId["parameters"];
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

  if (allParameters.length === 0) {
    return (
      <article className="flex flex-col gap-2 border-secondary border-1 px-4 py-3 rounded-sm w-full">
        <p className="text-muted-foreground text-sm">
          Brak specyfikacji produktu
        </p>
      </article>
    );
  }

  return (
    <article className="flex flex-col gap-2 border-secondary border-1 px-4 py-3 rounded-sm w-full">
      <h3 className="text-xl font-bold mb-2">Specyfikacja</h3>
      <ul className="flex flex-col gap-2">
        {allParameters.map(([key, value]) => (
          <li
            key={key}
            className="flex justify-between items-start border-b border-secondary/50 pb-2 last:border-b-0 last:pb-0"
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
    </article>
  );
}
