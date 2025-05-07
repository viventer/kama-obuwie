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

export default function CreateProductsNewDataTable({
  data,
}: {
  data: ProductWithId[] | null;
}) {
  const { productType } = useProductTypeContext();

  const columnNames: ColumnName<ProductWithId>[] = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "colorVariants", displayName: "Warianty" },
    { attributeName: "purchasePrice", displayName: "Cena zakupu" },
  ];

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
          const updateData: Partial<Product> = {
            creationStage: "photos",
          };
          await axios.patch(`/api/products/${id}`, updateData);
          showToast(
            "Produkt został przeniesiony do kolejnego etapu.",
            "success"
          );
        } catch (err) {
          showToast("Nie można przenieść produktu: ${err}", "error");
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
      {data ? (
        <DataTable
          data={data}
          columnNames={columnNames}
          actions={actions}
          searchPlaceholder="Szukaj tabeli"
          searchColumns={["brand", "manufacturerCode"]}
          hasImages={true}
          imageAttribute="samplePhoto"
          imageFolderPath={`products/sample-photos/${productType}`}
        />
      ) : (
        <p className="mt-4">Brak nowych produktów</p>
      )}
    </>
  );
}
