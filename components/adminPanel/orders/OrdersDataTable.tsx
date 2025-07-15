"use client";

import { useState, Fragment } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ColumnDef,
  ColumnFiltersState,
  ExpandedState,
  Row,
  RowSelectionState,
  SortingState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { MoreVertical, ChevronLeft, ChevronRight, Mail } from "lucide-react";
import { Order, OrderPhase } from "@/firebase/schemas/ordersSchemas";
import { OrderLineItemDisplay } from "./OrderLineItemDisplay";
import { OrderInfoDisplay } from "./OrderInfoDisplay";

interface OrdersDataTableProps {
  orders: Order[];
  orderPhase?: OrderPhase;
}

export default function OrdersDataTable({
  orders,
  orderPhase,
}: OrdersDataTableProps) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  // Kolumny do przeszukiwania - tak jak w DataTable.tsx
  const searchColumns = [
    "number",
    "buyer.firstName",
    "buyer.lastName",
    "buyer.phoneNumber",
  ];

  // Funkcja filtrowania - wzorowana na DataTable.tsx
  const globalFilterFn = (
    row: Row<Order>,
    columnId: string,
    filterValue: string
  ) => {
    const order = row.original;
    const searchValue = filterValue.toLowerCase();

    // Przeszukuj podstawowe kolumny
    const searchInBasicColumns = searchColumns.some((colKey) => {
      const keys = colKey.split(".");
      let value: any = order;

      for (const key of keys) {
        value = value?.[key];
      }

      if (value == null) return false;
      return String(value).toLowerCase().includes(searchValue);
    });

    if (searchInBasicColumns) return true;

    // Przeszukuj sygnatury produktów
    const searchInSignatures = order.lineItems.some((item) =>
      item.offer.signature?.toLowerCase().includes(searchValue)
    );

    return searchInSignatures;
  };

  const columns: ColumnDef<Order>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={table.getIsAllPageRowsSelected()}
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Zaznacz wszystkie"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={row.getIsSelected()}
          onCheckedChange={(value) => row.toggleSelected(!!value)}
          aria-label="Zaznacz wiersz"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "orderInfo",
      header: "Informacje o zamówieniu",
      cell: ({ row }) => <OrderInfoDisplay order={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "lineItems",
      header: "Produkty",
      cell: ({ row }) => (
        <OrderLineItemDisplay lineItems={row.getValue("lineItems")} />
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.messageToSeller && (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <Mail className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    globalFilterFn,
    onGlobalFilterChange: setGlobalFilter,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      expanded,
      globalFilter,
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Pole wyszukiwania */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Szukaj zamówień (numer, sygnatura, imię, nazwisko, telefon)..."
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-sm"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <Fragment key={row.id}>
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="cursor-pointer"
                    onClick={(e) => {
                      const target = e.target as HTMLElement;
                      if (
                        target.closest("button") ||
                        target.closest("[role='checkbox']") ||
                        target.closest("[data-ignore-row-click]")
                      ) {
                        return;
                      }
                      row.toggleExpanded();
                    }}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {row.getIsExpanded() && (
                    <TableRow>
                      <TableCell colSpan={columns.length} className="p-0">
                        <div className="p-4 bg-gray-50">
                          {/* Tutaj będą dodatkowe informacje o zamówieniu */}
                          <p className="text-sm text-gray-600">
                            Dodatkowe informacje o zamówieniu (do implementacji)
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Brak zamówień.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginacja */}
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} z{" "}
          {table.getFilteredRowModel().rows.length} wierszy zaznaczonych.
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            Poprzednia
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Następna
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
