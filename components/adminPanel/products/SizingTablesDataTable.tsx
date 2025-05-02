"use client";

import { ColumnName, TableAction } from "@/lib/dataTableColumns";
import { DataTable } from "../global/DataTable";
import { SizingTable } from "@/firebase/schemas/products";
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

export default function SizingTablesDataTable({
  data,
}: {
  data: SizingTable[];
}) {
  const columnNames: ColumnName<SizingTable>[] = [
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
  ];

  const renderRowSubComponent = (row: SizingTable) => {
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
      const resp = await axios.post("/api/sizing-tables", {
        name: "Nowa tabela rozmiarów",
        insoleLengths: [],
      });
      const id = resp.data.id;
      console.log(resp);
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
        data={data}
        columnNames={columnNames}
        actions={actions}
        renderRowSubComponent={renderRowSubComponent}
        searchPlaceholder="Szukaj tabeli"
        searchColumns={["name"]}
      />
    </>
  );
}
