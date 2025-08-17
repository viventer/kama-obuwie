"use client";

import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { Button } from "@/components/ui/button";
import {
  Product,
  ProductSchema,
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
import { z } from "zod";

export default function CreateProductsNewDataTable({
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
      const areColorVariantsValid =
        !!product.colorVariants &&
        product.colorVariants.length > 0 &&
        product.colorVariants[0]?.color !== "";

      const isValid =
        product.manufacturerCode.length >= 3 &&
        (productType === "akcesoria" || areColorVariantsValid) &&
        product.purchasePrice > 0 &&
        product.suggestedPrice > 0;

      return { ...product, isReady: isValid };
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
  const { showDialog } = useConfirmDialog();

  const handleDeleteProduct = async (id: string) => {
    showDialog({
      message: "Czy na pewno chcesz usunąć ten produkt?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/products/${id}`);
          showToast("Produkt został usunięty", "success");
          router.refresh();
        } catch (err) {
          showToast(`Nie udało się usunąć produktu: ${err}`, "error");
        }
      },
    });
  };

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
            creationStage: "photos",
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
      name: "Edytuj",
      onClick: (id) => {
        router.push(`/admin-panel/create-products/new/${id}`);
      },
    },
    {
      name: "Usuń",
      onClick: (id) => {
        if (id === undefined) {
          showToast("Nie można usunąć produktu", "error");
          return;
        }
        handleDeleteProduct(id);
      },
    },
  ];

  const handleCreateProduct = async () => {
    router.push("/admin-panel/create-products/new/form");
  };

  return (
    <>
      <Button onClick={handleCreateProduct}>Utwórz nowy</Button>
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
    </>
  );
}
