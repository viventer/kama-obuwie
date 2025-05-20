"use client";

import {
  DescriptionSchema,
  Product,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useEffect, useState } from "react";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { DataTable } from "../../global/data-table/DataTable";

export default function CreateProductsDescriptionDataTable({
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
  ];
  const shoesProductColumnNames = [
    ...elementaryColumnNames,
    { attributeName: "colorVariants", displayName: "Warianty" },
  ];
  const [columnNames, setColumnNames] = useState<ColumnName<ProductWithId>[]>(
    elementaryColumnNames
  );

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

  const router = useRouter();
  const { showToast } = useToast();

  const actions: TableAction[] = [
    {
      name: "Przenieś dalej",
      onClick: async (id) => {
        try {
          const productData = data?.find((product) => product.id === id);
          const description = productData?.description;
          if (!description || description.length === 0) {
            showToast(
              "Nie można przenieść produktu, ponieważ nie ma opisu.",
              "error"
            );
            return;
          }
          DescriptionSchema.parse(description);

          const updateData: Partial<Product> = {
            creationStage: "postOffer",
          };
          await axios.patch(`/api/products/${id}`, updateData);
          showToast(
            "Produkt został przeniesiony do kolejnego etapu.",
            "success"
          );
          router.refresh();
        } catch (err) {
          showToast(`Nie można przenieść produktu: ${err}`, "error");
        }
      },
    },
    {
      name: "Utwórz opis",
      onClick: (id) => {
        router.push(`/admin-panel/create-products/description/${id}`);
      },
    },
    {
      name: "Cofnij do poprzedniego etapu",
      onClick: async (id) => {
        try {
          const updateData: Partial<Product> = {
            creationStage: "parameters",
          };
          await axios.patch(`/api/products/${id}`, updateData);
          showToast(
            "Produkt został przeniesiony do poprzedniego etapu.",
            "success"
          );
          router.refresh();
          setFilteredData(filteredData);
        } catch (err) {
          showToast(`Nie można przenieść produktu: ${err}`, "error");
        }
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
