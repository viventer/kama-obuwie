"use client";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function ProductsDataTable({
  data,
}: {
  data: ProductWithId[] | null;
}) {
  const { productType } = useProductTypeContext();
  const [filteredData, setFilteredData] = useState<ProductWithId[] | null>(
    null
  );

  const elementaryColumnNames = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "purchasePrice", displayName: "Cena zakupu" },
    { attributeName: "suggestedPrice", displayName: "Cena sugerowana" },
  ];
  const shoesProductColumnNames = [
    ...elementaryColumnNames,
    { attributeName: "colorVariants", displayName: "Warianty" },
  ];
  const [columnNames, setColumnNames] = useState<ColumnName<ProductWithId>[]>(
    elementaryColumnNames
  );

  const router = useRouter();

  useEffect(() => {
    if (!data) {
      return;
    }

    const newData = data.filter(
      (product) => product.productType === productType
    );
    setFilteredData(newData);

    if (
      productType === "obuwie" &&
      columnNames.length !== shoesProductColumnNames.length
    ) {
      setColumnNames(shoesProductColumnNames);
    } else if (productType === "akcesoria") {
      setColumnNames(elementaryColumnNames);
    }
  }, [data, productType]);

  const actions: TableAction[] = [
    {
      name: "Zobacz dane",
      onClick: (id) => {
        window.open(
          `/admin-panel/create-products/product-data/${id}`,
          "_blank",
          "noopener,noreferrer"
        );
      },
    },
    {
      name: "Edytuj parametry",
      onClick: (id) => {
        router.push(`/admin-panel/products/parameters/${id}`);
      },
    },
    {
      name: "Edytuj zdjęcia",
      onClick: (id) => {
        router.push(`/admin-panel/products/images/${id}`);
      },
    },
    {
      name: "Edytuj opis",
      onClick: (id) => {
        router.push(`/admin-panel/products/description/${id}`);
      },
    },
  ];

  return (
    <DataTable
      data={filteredData || []}
      columnNames={columnNames}
      actions={actions}
      searchPlaceholder="Szukaj produktu"
      searchColumns={["brand", "manufacturerCode"]}
      hasImages={true}
      imageAttribute="samplePhoto"
      imageFolderPath={`products/sample-photos/${productType}`}
    />
  );
}
