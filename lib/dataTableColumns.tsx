import { getColorVariantName } from "@/components/adminPanel/products/helpers/productsHelpers";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal } from "lucide-react";

export type ColumnName<T> = {
  attributeName: string;
  displayName: string;
};

export type TableAction = {
  name: string;
  onClick: (id?: string) => void;
};

function getSelectAllColumn<T extends { id: string }>(): ColumnDef<T, unknown> {
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
      if (attributeName === "colorVariants") {
        const value = row.getValue(attributeName) as ColorVariant[];
        const colors = value.map((colorVariant: ColorVariant) => {
          const colorVariantName = getColorVariantName(colorVariant);
          return colorVariantName;
        });
        return colors.join(", ");
      }
      const value = row.getValue(attributeName) || "brak";
      return Array.isArray(value) ? value.join(", ") : value;
    },
  }));
}

export function getDataTableColumns<T extends { id: string }>(
  columnNames: ColumnName<T>[],
  tableActions?: TableAction[]
): ColumnDef<T, unknown>[] {
  const dataColumns = getDataColumns<T>(columnNames);

  if (!tableActions || tableActions.length === 0) {
    return [...dataColumns];
  }

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
            <DropdownMenuItem
              key={action.name}
              onClick={() => action.onClick(row.original.id)}
            >
              {action.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  };

  return [...dataColumns, actionColumn];
}
