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

export default function SizingTablesDataTable({
  data,
}: {
  data: SizingTable[];
}) {
  const columnNames: ColumnName<SizingTable>[] = [
    { attributeName: "name", displayName: "Nazwa" },
  ];

  const actions: TableAction[] = [
    {
      name: "Edytuj",
      onClick: () => {
        console.log("Edytuj");
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
          {row.insoleLenghts.map((size) => (
            <TableRow key={size.size}>
              <TableCell>{size.size}</TableCell>
              <TableCell>{size.insoleLength}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  };

  return (
    <DataTable
      data={data}
      columnNames={columnNames}
      actions={actions}
      renderRowSubComponent={renderRowSubComponent}
      searchPlaceholder="Szukaj tabeli rozmiarów"
      searchColumns={["name"]}
    />
  );
}
