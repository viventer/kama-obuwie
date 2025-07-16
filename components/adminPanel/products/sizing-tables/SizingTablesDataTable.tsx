"use client";

import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import {
  ProductWithId,
  SizingTable,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { DataTable } from "../../global/data-table/DataTable";

export default function SizingTablesDataTable({
  data,
}: {
  data: SizingTableWithId[] | null;
}) {
  const columnNames: ColumnName<SizingTableWithId>[] = [
    { attributeName: "name", displayName: "Nazwa" },
  ];

  const router = useRouter();
  const { showToast } = useToast();

  const actions: TableAction[] = [
    {
      name: "Edytuj",
      onClick: (id) => {
        router.push(`/admin-panel/sizing-tables/${id}`);
      },
    },
    {
      name: "Usuń",
      onClick: (id) => {
        if (id === undefined) {
          showToast("Nie można usunąć tabeli rozmiarów", "error");
          return;
        }
        handleDeleteSizingTable(id);
      },
    },
  ];

  const { showDialog } = useConfirmDialog();

  const handleDeleteSizingTable = async (id: string) => {
    const resp = await axios.get(`/api/products?sizingTableId=${id}`);
    const connectedProducts: ProductWithId[] | null = Object.values(resp.data);

    if (connectedProducts && connectedProducts.length > 0) {
      showToast(
        "Nie można usunąć tabeli rozmiarów, ponieważ jest podłączona do produktów.",
        "error"
      );
      return;
    }

    showDialog({
      message: "Czy na pewno chcesz usunąć tę tabelę rozmiarów?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        try {
          await axios.delete(`/api/sizing-tables/${id}`);
          showToast("Tabela rozmiarów została usunięta", "success");
          router.refresh();
        } catch (err) {
          showToast(`Nie udało się usunąć tabeli rozmiarów: ${err}`, "error");
        }
      },
    });
  };

  const renderRowSubComponent = (row: SizingTableWithId) => {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Rozmiar</TableHead>
            <TableHead>Długość wkładki</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {row.insoleLengths.map((size) => (
            <TableRow key={size.size}>
              <TableCell>{size.size}</TableCell>
              <TableCell>{size.insoleLength}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  const handleCreateSizingTable = async () => {
    try {
      const newSizingTable: SizingTable = {
        name: "Nowa tabela rozmiarów",
        insoleLengths: [],
        sizingAccuracy: "normalna",
      };

      const resp = await axios.post("/api/sizing-tables", newSizingTable);
      const id = resp.data.id;
      router.push(`/admin-panel/sizing-tables/${id}`);
      showToast("Tabela rozmiarów została utworzona", "success");
    } catch (err) {
      showToast(`Nie udało się utworzyć tabeli rozmiarów: ${err}`, "error");
      return;
    }
  };

  return (
    <>
      <Button onClick={handleCreateSizingTable}>Utwórz nową</Button>
      <DataTable
        data={data || []}
        columnNames={columnNames}
        actions={actions}
        renderRowSubComponent={renderRowSubComponent}
        searchPlaceholder="Szukaj tabeli"
        searchColumns={["name"]}
        disableSelection={true}
      />
    </>
  );
}
