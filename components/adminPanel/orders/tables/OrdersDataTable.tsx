"use client";

import { useState, Fragment, useEffect } from "react";
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
import {
  ChevronLeft,
  ChevronRight,
  FilePlus2Icon,
  Mail,
  MoreHorizontal,
  PackageIcon,
} from "lucide-react";
import { Order, OrderPhase } from "@/firebase/schemas/ordersSchemas";
import { OrderLineItemDisplay } from "./OrderLineItemDisplay";
import { OrderInfoDisplay } from "./OrderInfoDisplay";
import IconButton from "../../global/IconButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useOrderActions } from "@/hooks/useOrderActions";
import OrderCostDisplay from "./OrderCostDisplay";
import { useRouter } from "next/navigation";
import { useDialogWindow } from "@/components/providers/DialogWindowProvider";
import ShipmentsDialogContent from "../ShipmentsDialogContent";

interface OrdersDataTableProps {
  orders: Order[];
  phase: OrderPhase;
}

export default function OrdersDataTable({
  orders,
  phase,
}: OrdersDataTableProps) {
  const [pagination, setPagination] = useState<{
    pageIndex: number;
    pageSize: number;
  }>({
    pageIndex: 0,
    pageSize: 30,
  });
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [globalFilter, setGlobalFilter] = useState("");

  const actions = useOrderActions(phase);
  const router = useRouter();
  const { openDialog } = useDialogWindow();

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
    // Ukryte kolumny dla wyszukiwania
    {
      accessorKey: "number",
      header: "Numer",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.firstName,
      id: "buyerFirstName",
      header: "Imię",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.lastName,
      id: "buyerLastName",
      header: "Nazwisko",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.phoneNumber,
      id: "buyerPhone",
      header: "Telefon",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.login,
      id: "buyerLogin",
      header: "Login",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) =>
        row.lineItems.map((item) => item.offer.signature).join(" "),
      id: "signatures",
      header: "Sygnatury",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      id: "orderInfo",
      header: "Podstawowe informacje",
      cell: ({ row }) => <OrderInfoDisplay order={row.original} />,
      enableSorting: false,
    },
    {
      id: "costInfo",
      header: "Koszty",
      cell: ({ row }) => <OrderCostDisplay order={row.original} />,
      enableSorting: false,
    },
    {
      accessorKey: "lineItems",
      header: "Produkty",
      cell: ({ row }) => (
        <OrderLineItemDisplay
          lineItems={row.getValue("lineItems")}
          refund={row.original.refund}
        />
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-col">
          {row.original.messageToSeller && (
            <IconButton className="text-destructive hover:text-primary">
              <Mail className="size-4" />
            </IconButton>
          )}
          {row.original?.invoice?.required && (
            <IconButton className="text-destructive hover:text-primary">
              <FilePlus2Icon className="size-4" />
            </IconButton>
          )}
          {row.original.fulfillment?.status !== "NEW" &&
            row.original.fulfillment?.status !== "CANCELLED" && (
              <IconButton
                className={`${
                  row.original?.shipment?.isCreated
                    ? "text-success"
                    : "text-destructive"
                } hover:text-primary`}
                onClick={() => {
                  if (!row.original?.shipment?.isCreated) {
                    router.push(
                      `/admin-panel/orders/create-label/${row.original.id}`
                    );
                  }

                  openDialog({
                    title: "Informacje o wysyłce",
                    content: (
                      <ShipmentsDialogContent
                        shipmentData={row.original?.shipment}
                        orderId={row.original.id as string}
                      />
                    ),
                  });
                }}
              >
                <PackageIcon className="size-4" />
              </IconButton>
            )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Otwórz menu</span>
                <MoreHorizontal />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {actions.map((action) => (
                <DropdownMenuItem
                  key={action.name}
                  onClick={() => action.onClick(row.original.id)}
                >
                  {action.name}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: orders,
    columns,
    getRowId: (row) => row.id || row.number,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        // Ukryj kolumny pomocnicze
        number: false,
        buyerFirstName: false,
        buyerLastName: false,
        buyerPhone: false,
        buyerLogin: false,
        signatures: false,
      },
      rowSelection,
      expanded,
      pagination,
    },
    onGlobalFilterChange: setGlobalFilter,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onExpandedChange: setExpanded,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div className="w-full max-h-[70svh] max-w-[1440px]">
      {/* Pole wyszukiwania */}
      <div className="flex items-center py-4">
        <Input
          placeholder="Szukaj zamówień"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs"
        />
      </div>

      {/* Tabela */}
      <div className="rounded-md border max-h-[60svh] overflow-auto scrollbar">
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
                        target.closest("[role='checkbox']") ||
                        target.closest("[data-ignore-row-click]") ||
                        target.closest("[data-radix-popper-content-wrapper]") ||
                        target.closest("button") ||
                        target.closest("[role='menuitem']")
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

      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          wybrano {table.getSelectedRowModel().rows.length} z{" "}
          {table.getFilteredRowModel().rows.length} rzędów.
        </div>
        <div className="space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
