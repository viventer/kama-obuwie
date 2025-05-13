"use client";

import {
  Product,
  ProductCreationStage,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../global/DataTable";
import { useProductTypeContext } from "./ProductsTypeContext";
import { useEffect, useState } from "react";

type ProductWithStatus = ProductWithId & { isReady: boolean };

export default function CreateProductsPhotosDataTable({
  data,
  creationStage,
}: {
  data: ProductWithId[] | null;
  creationStage: ProductCreationStage;
}) {
  const { productType } = useProductTypeContext();
  const [filteredData, setFilteredData] = useState<ProductWithStatus[] | null>(
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
  const [columnNames, setColumnNames] = useState<
    ColumnName<ProductWithStatus>[]
  >(elementaryColumnNames);

  useEffect(() => {
    if (!data) {
      return;
    }

    const newData = data.filter(
      (product) => product.productType === productType
    );
    const newDataWithStatus: ProductWithStatus[] = newData.map((product) => {
      const { rawPhotos, editedPhotos } = product;
      const hasRawPhotos = (rawPhotos && rawPhotos?.length > 0) || false;
      const hasEditedPhotos =
        (editedPhotos && editedPhotos?.length > 0) || false;
      const isReady =
        (creationStage === "photosEdit" && hasEditedPhotos) ||
        (creationStage === "photos" && hasRawPhotos);
      return {
        ...product,
        isReady,
      };
    });
    setFilteredData(newDataWithStatus);

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
        const productData = filteredData?.find((product) => product.id === id);
        if (!productData) {
          showToast("Nie można znaleźć produktu", "error");
          return;
        }
        const { rawPhotos } = productData;
        const { editedPhotos } = productData;
        const hasRawPhotos = rawPhotos && rawPhotos?.length > 0;
        const hasEditedPhotos = editedPhotos && editedPhotos?.length > 0;
        if (
          (creationStage === "photosEdit" && !hasEditedPhotos) ||
          (creationStage === "photos" && !hasRawPhotos)
        ) {
          showToast(
            "Nie można przenieść produktu, ponieważ nie ma dodanych zdjęć.",
            "error"
          );
          return;
        }

        try {
          const updateData: Partial<Product> = {
            creationStage:
              creationStage == "photosEdit" ? "parameters" : "photosEdit",
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
      name: "Cofnij do poprzedniego etapu",
      onClick: async (id) => {
        try {
          const updateData: Partial<Product> = {
            creationStage: creationStage == "photosEdit" ? "photos" : "new",
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
    {
      name: "Dodaj zdjęcia",
      onClick: (id) => {
        const endpoint =
          creationStage === "photosEdit" ? "photos-edit" : "photos";
        router.push(`/admin-panel/create-products/${endpoint}/${id}`);
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
      isReadyAttribute="isReady"
    />
  );
}
