"use client";

import { useConfirmDialog } from "@/components/global/ConfirmDialogProvider";
import { Button } from "@/components/ui/button";
import { Product, ProductWithId } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import axios from "axios";
import { useRouter } from "next/navigation";
import { DataTable } from "../global/DataTable";

export default function CreateProductsNewDataTable({
  data,
}: {
  data: ProductWithId[];
}) {
  const columnNames: ColumnName<ProductWithId>[] = [
    { attributeName: "brand", displayName: "Marka" },
    { attributeName: "manufacturerCode", displayName: "Kod producenta" },
    { attributeName: "colors", displayName: "Kolory" },
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
    try {
      const newProduct: Product = {
        brand: "Nazwa marki",
        manufacturerCode: "Kod producenta",
        productType: "obuwie",
        samplePhotoUrl: "",
        purchasePrice: 123,
        creationStage: "new",
      };

      const resp = await axios.post("/api/products", newProduct);
      const id = resp.data.id;
      router.push(`/admin-panel/products/${id}`);
      showToast("Produkt został utworzony", "success");
    } catch (err) {
      showToast(`Nie udało się utworzyć produktu: ${err}`, "error");
      return;
    }
  };

  return (
    <>
      <Button onClick={handleCreateProduct}>Utwórz nowy</Button>
      <DataTable
        data={data}
        columnNames={columnNames}
        actions={actions}
        searchPlaceholder="Szukaj tabeli"
        searchColumns={["brand", "manufacturerCode"]}
        hasImages={true}
        imageUrlAttribute="samplePhotoUrl"
      />
    </>
  );
}
