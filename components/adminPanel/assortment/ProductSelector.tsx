"use client";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { DataTable } from "../global/data-table/DataTable";
import { useProductTypeContext } from "./ProductsTypeContext";

export default function ProductSelector({
  availableProducts,
  setSelectedProductId,
}: {
  availableProducts: ProductWithId[];
  setSelectedProductId: (productId: string) => void;
}) {
  const { productType } = useProductTypeContext();

  const columnNames = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "purchasePrice", displayName: "Cena zakupu" },
  ];

  return (
    <DataTable
      data={availableProducts}
      columnNames={columnNames}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["brand", "manufacturerCode"]}
      hasImages={true}
      imageAttribute="samplePhoto"
      imageFolderPath={`products/sample-photos/${productType}`}
      maxSelectable={1}
      onSelectionChange={(rows) => {
        if (rows.length > 0) {
          setSelectedProductId(rows[0].id);
        } else {
          setSelectedProductId("");
        }
      }}
    />
  );
}
