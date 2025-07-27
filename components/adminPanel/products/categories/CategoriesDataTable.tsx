"use client";

import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../../global/data-table/DataTable";
import {
  Category,
  CategoryWithAllegroCategoryName,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";

export default function CategoriesDataTable({
  data,
}: {
  data: CategoryWithAllegroCategoryName[] | null;
}) {
  const columnNames: ColumnName<CategoryWithAllegroCategoryName>[] = [
    { attributeName: "name", displayName: "Nazwa" },
    { attributeName: "rootCategory", displayName: "Kategoria główna" },
  ];

  const router = useRouter();
  const { showToast } = useToast();

  const actions: TableAction[] = [
    {
      name: "Edytuj",
      onClick: (id) => {
        router.push(`/admin-panel/categories/${id}`);
      },
    },
    {
      name: "Usuń",
      onClick: (id) => {
        if (id === undefined) {
          showToast("Nie można usunąć kategorii", "error");
          return;
        }
        handleDeleteCategory(id);
      },
    },
  ];

  const { showDialog } = useConfirmDialog();

  const handleDeleteCategory = async (id: string) => {
    const resp = await axios.get(`/api/products?categoryId=${id}`);
    const connectedProducts: ProductWithId[] | null = Object.values(resp.data);

    if (connectedProducts && connectedProducts.length > 0) {
      showToast(
        "Nie można usunąć kategorii, ponieważ jest podłączona do produktów.",
        "error"
      );
      return;
    }

    showDialog({
      message: "Czy na pewno chcesz usunąć tę kategorię?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/categories/${id}`);
          showToast("Kategoria została usunięta", "success");
          router.refresh();
        } catch (err) {
          showToast(`Nie udało się usunąć kategorii: ${err}`, "error");
        }
      },
    });
  };

  const renderRowSubComponent = (row: CategoryWithAllegroCategoryName) => {
    return (
      <div className="flex flex-col gap-2 px-4 py-2">
        <p>
          <b>Parametry wariantowe: </b>
          {row.variantParameters.join(", ") || "brak"}
        </p>
        <p>
          <b>Kategoria Allegro: </b>
          {row.allegroCategoryName || "brak"}
        </p>
      </div>
    );
  };

  const handleCreateCategory = async () => {
    try {
      const newCategory: Category = {
        name: "Nowa kategoria",
        allegroCategoryId: "",
        variantParameters: [],
        rootCategory: "obuwie męskie",
      };

      const resp = await axios.post("/api/categories", newCategory);
      const id = resp.data.id;
      router.push(`/admin-panel/categories/${id}`);
      showToast("Kategoria została utworzona", "success");
    } catch (err) {
      showToast(`Nie udało się utworzyć kategorii: ${err}`, "error");
      return;
    }
  };

  return (
    <>
      <Button onClick={handleCreateCategory}>Utwórz nową</Button>
      <DataTable
        data={data || []}
        columnNames={columnNames}
        actions={actions}
        renderRowSubComponent={renderRowSubComponent}
        searchPlaceholder="Szukaj kategorii"
        searchColumns={["name"]}
        disableSelection={true}
      />
    </>
  );
}
