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
import { ChevronLeft, ChevronRight, CheckCircle, Download } from "lucide-react";
import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { ReturnInfoDisplay } from "./ReturnInfoDisplay";
import { ReturnBuyerDataDisplay } from "./ReturnBuyerDataDisplay";
import { ReturnItemsDisplay } from "./ReturnItemsDisplay";
import IconButton from "../../global/IconButton";
import { useDialogWindow } from "@/components/providers/DialogWindowProvider";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import axios from "axios";
import { getOrderByAllegroId } from "@/server-actions/orders/orders";

interface ReturnsDataTableProps {
  returns: AllegroReturn[];
}

export default function ReturnsDataTable({ returns }: ReturnsDataTableProps) {
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

  const { openDialog } = useDialogWindow();
  const { showToast } = useToast();
  const router = useRouter();

  const handleApproveAndRefund = async (returnId: string) => {
    openDialog({
      title: "Potwierdź akcję",
      content: (
        <p>
          Czy na pewno chcesz zatwierdzić zwrot i zainicjować zwrot wpłaty? Tej
          akcji nie można cofnąć.
        </p>
      ),
      onConfirm: async () => {
        try {
          const returnData = returns.find((r) => r.id === returnId);
          if (!returnData) {
            showToast("Nie znaleziono zwrotu o podanym ID", "error");
            return;
          }
          const order: OrderWithId = await getOrderByAllegroId(
            returnData.orderId
          );
          const paidAmount = Number(order.payment?.paidAmount?.amount) || 0;
          const deliveryCost = Number(order.delivery?.cost?.amount) || 0;
          const refundAmount = Number(order.refund?.amount?.amount) || 0;
          const isAllRefunded = refundAmount >= paidAmount - deliveryCost;

          if (
            !paidAmount ||
            !order.payment?.id ||
            order.payment.type === "CASH_ON_DELIVERY" ||
            isAllRefunded
          ) {
            showToast(
              "Nie można zwrócić wpłaty, ponieważ zamówienie nie ma opłaconej kwoty lub jest to zamówienie za pobraniem.",
              "error"
            );
            return;
          }
          router.push(`/admin-panel/orders/send-refund/${order.id}`);
        } catch (error) {
          showToast("Wystąpił błąd podczas zatwierdzania zwrotu", "error");
        }
      },
      confirmText: "Zatwierdź i zwróć wpłatę",
      cancelText: "Anuluj",
      hasCancelButton: true,
    });
  };

  const handleDownloadDocument = async (returnId: string) => {
    try {
      // Tutaj będzie implementacja pobierania dokumentu
      console.log("Pobieranie dokumentu dla zwrotu:", returnId);
      showToast("Dokument zostanie pobrany", "success");
    } catch (error) {
      showToast("Wystąpił błąd podczas pobierania dokumentu", "error");
    }
  };

  const columns: ColumnDef<AllegroReturn>[] = [
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
      accessorKey: "referenceNumber",
      header: "Numer zwrotu",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.login,
      id: "buyerLogin",
      header: "Login kupującego",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.buyer.email,
      id: "buyerEmail",
      header: "Email kupującego",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      accessorFn: (row) => row.items.map((item) => item.name).join(" "),
      id: "itemNames",
      header: "Nazwy produktów",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: false,
      size: 0,
      meta: { hidden: true },
    },
    {
      id: "returnInfo",
      header: "Dane zwrotu",
      cell: ({ row }) => <ReturnInfoDisplay return={row.original} />,
      enableSorting: false,
    },
    {
      id: "additionalData",
      header: "Dane kupującego",
      cell: ({ row }) => <ReturnBuyerDataDisplay return={row.original} />,
      enableSorting: false,
    },
    {
      id: "items",
      header: "Produkty",
      cell: ({ row }) => (
        <ReturnItemsDisplay
          items={row.original.items}
          allegroOrderId={row.original.orderId}
        />
      ),
      enableSorting: false,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => (
        <div className="flex items-center gap-2 flex-col">
          <IconButton
            className="text-primary hover:text-primary"
            onClick={() => handleApproveAndRefund(row.original.id)}
            title="Zatwierdź i zwróć wpłatę"
          >
            <CheckCircle className="size-4" />
          </IconButton>
          <IconButton
            className="text-primary hover:text-primary"
            onClick={() => handleDownloadDocument(row.original.id)}
            title="Pobierz dokument potwierdzający"
          >
            <Download className="size-4" />
          </IconButton>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];

  const table = useReactTable({
    data: returns,
    columns,
    getRowId: (row) => row.id,
    state: {
      globalFilter,
      sorting,
      columnFilters,
      columnVisibility: {
        ...columnVisibility,
        // Ukryj kolumny pomocnicze
        referenceNumber: false,
        buyerLogin: false,
        buyerEmail: false,
        itemNames: false,
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
          placeholder="Szukaj zwrotów"
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
                </Fragment>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Brak zwrotów.
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
