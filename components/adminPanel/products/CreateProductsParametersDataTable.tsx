"use client";

import { useConfirmDialog } from "@/components/adminPanel/global/ConfirmDialogProvider";
import { Button } from "@/components/ui/button";
import { Product, ProductWithId } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../global/DataTable";
import { useProductTypeContext } from "./ProductsTypeContext";
import { useEffect, useState } from "react";

export default function CreateProductsParametersDataTable({
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
  const { showDialog } = useConfirmDialog();

  const actions: TableAction[] = [
    {
      name: "Przenieś dalej",
      onClick: async (id) => {
        try {
          const updateData: Partial<Product> = {
            creationStage: "description",
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
      name: "Dodaj parametry",
      onClick: (id) => {
        router.push(`/admin-panel/create-products/parameters/${id}`);
      },
    },
    {
      name: "Cofnij do poprzedniego etapu",
      onClick: async (id) => {
        try {
          const updateData: Partial<Product> = {
            creationStage: "photosEdit",
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
