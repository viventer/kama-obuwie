import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type ColumnName<T> = {
  attributeName: string;
  displayName: string;
};

export type TableAction = {
  name: string;
  onClick: () => void;
};

function getSelectAllColumn<T>(): ColumnDef<T, unknown> {
  return {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Wybierz wszystkie wiersze"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Wybierz wiersz"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  };
}

function getDataColumns<T>(
  columnNames: ColumnName<T>[]
): ColumnDef<T, unknown>[] {
  return columnNames.map(({ attributeName, displayName }) => ({
    accessorKey: attributeName,
    header: displayName,
    cell: ({ row }) => {
      const value = row.getValue(attributeName);
      return Array.isArray(value) ? value.join(", ") : value;
    },
  }));
}

export function getDataTableColumns<T>(
  columnNames: ColumnName<T>[],
  tableActions?: TableAction[]
): ColumnDef<T, unknown>[] {
  const dataColumns = getDataColumns<T>(columnNames);

  const actionColumn: ColumnDef<T, unknown> = {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Otwórz menu</span>
            <MoreHorizontal />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {tableActions?.map((action) => (
            <DropdownMenuItem key={action.name} onClick={action.onClick}>
              {action.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  return [getSelectAllColumn<T>(), ...dataColumns, actionColumn];
}
