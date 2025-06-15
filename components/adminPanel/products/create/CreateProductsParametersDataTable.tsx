"use client";

import {
  Product,
  ProductWithId,
  ProductWithStatus,
} from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../../global/data-table/DataTable";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useEffect, useState } from "react";

export default function CreateProductsParametersDataTable({
  data,
}: {
  data: ProductWithId[] | null;
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
      const requiredParameters = product?.parameters?.required;
      const optionalParameters = product?.parameters?.optional;
      if (!requiredParameters && !optionalParameters) {
        return { ...product, isReady: false };
      }
      if (requiredParameters) {
        const allRequiredFilled = Object.values(requiredParameters).every(
          (value) => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined && value !== "";
          }
        );
        if (!allRequiredFilled) {
          console.log(requiredParameters);
          return { ...product, isReady: false };
        }
      }
      return { ...product, isReady: true };
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
        try {
          const productData = filteredData?.find(
            (product) => product.id === id
          );
          if (!productData || !productData.isReady) {
            showToast(
              "Nie można przenieść produktu. Uzupełnij wszystkie wymagane parametry.",
              "error"
            );
            return;
          }
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
      name: "Uzupełnij parametry",
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
