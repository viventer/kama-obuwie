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
import {
  AllegroReturn,
  CustomerBankAccountData,
  ReturnFormData,
} from "@/firebase/schemas/returnsSchemas";
import { ReturnInfoDisplay } from "./ReturnInfoDisplay";
import { ReturnBuyerDataDisplay } from "./ReturnBuyerDataDisplay";
import { ReturnItemsDisplay } from "./ReturnItemsDisplay";
import IconButton from "../../global/IconButton";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { getOrderByAllegroId } from "@/server-actions/orders/orders";
import axios from "axios";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useFullPageLoading } from "../../global/FullPageLoader";
import RefundTransferDetails from "../RefundTransferDetails";
import { syncOffersAvailability } from "@/server-actions/offers/offers";
import { returnStatusTranslations } from "@/lib/constants";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  const { openDialog } = useDialogWindow();
  const { showToast } = useToast();
  const router = useRouter();

  const handleApproveAndRefund = async (returnId: string) => {
    try {
      const returnData = returns.find((r) => r.id === returnId);
      if (!returnData) {
        showToast("Nie znaleziono zwrotu o podanym ID", "error");
        return;
      }
      const order: OrderWithId = await getOrderByAllegroId(returnData.orderId);
      const paidAmount = Number(order.payment?.paidAmount?.amount) || 0;
      const deliveryCost = Number(order.delivery?.cost?.amount) || 0;
      const refundAmount = Number(order.refund?.amount?.amount) || 0;
      const isAllRefunded = refundAmount >= paidAmount - deliveryCost;

      if (order?.payment?.type === "CASH_ON_DELIVERY") {
        openDialog({
          title: "Zwróć wpłatę przelewem",
          content: (
            <RefundTransferDetails
              accountData={
                returnData.refund?.bankAccount as CustomerBankAccountData
              }
            />
          ),
          description:
            "Jest to zamówienie za pobraniem, dlatego zwrot przez Allegro Finanse nie jest możliwy.",
          confirmText: "Wpłata została zwrócona",
          cancelText: "Anuluj",
          hasCancelButton: true,
          onConfirm: async () => {
            startLoading();
            const returnedItemsFromOrder = order.lineItems
              .map((orderItem, index) => {
                const refundItem = returnData.items![index];

                if (refundItem?.quantity && refundItem.quantity > 0) {
                  return {
                    ...orderItem,
                    quantity: refundItem.quantity,
                  };
                }
              })
              .filter((item) => item !== undefined);

            await syncOffersAvailability(
              returnedItemsFromOrder,
              order.salesChannel as "AL1" | "AL2",
              "return"
            );

            const itemsForRefundDocument = returnedItemsFromOrder.map(
              (item) => ({
                name: item.offer.name,
                quantity: Number(item.quantity),
                value: (
                  Number(item.price.amount) * Number(item.quantity)
                ).toString(),
              })
            );

            const refundAmount = itemsForRefundDocument.reduce(
              (sum, item) => sum + Number(item.value),
              0
            );

            try {
              const response = await axios.post(`/api/orders/refund-document`, {
                items: itemsForRefundDocument,
              });

              const { filePath, url } = response.data;
              if (!filePath || !url) {
                throw new Error(
                  "Nie udało się wygenerować dokumentu zwrotu wpłaty"
                );
              }
              window.open(url, "_blank");

              await axios.patch(`/api/orders/${order.id}`, {
                refund: {
                  type: "FULL",
                  amount: {
                    amount: refundAmount.toString(),
                    currency: "PLN",
                  },
                  reason: "REFUND",
                  lineItems: returnedItemsFromOrder.map((item) => ({
                    id: item.id,
                    type: "AMOUNT",
                    quantity: item.quantity,
                    value: {
                      amount: (
                        Number(item.price.amount) * Number(item.quantity)
                      ).toString(),
                      currency: item.price.currency,
                    },
                  })),
                  refundDocument: {
                    items: itemsForRefundDocument,
                    filePath: filePath,
                  },
                },
              });
              showToast(
                "Dokument zwrotu wpłaty został wygenerowany.",
                "success"
              );
            } catch (error: any) {
              handleError(
                error,
                "Błąd podczas generowania dokumentu zwrotu wpłaty"
              );
            } finally {
              stopLoading();
            }
          },
        });

        return;
      }

      if (!paidAmount || !order.payment?.id || isAllRefunded) {
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
  };

  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading } = useFullPageLoading();

  const handleDownloadDocument = async (returnId: string) => {
    startLoading();
    try {
      const returnData = returns.find((r) => r.id === returnId);
      if (!returnData) {
        showToast("Nie znaleziono zwrotu o podanym ID", "error");
        return;
      }

      const order: OrderWithId = await getOrderByAllegroId(returnData.orderId);
      const returnFormData: ReturnFormData = {
        sellerData: {
          companyName: "Anna Kamińska KAM-A",
          nip: "8681255945",
          street: "Hala Targowa Gazaris box nr 39",
          city: "Bochnia",
          zipCode: "32-700",
          country: "Polska",
        },
        items: returnData.items,
        totalValue: returnData.items
          .reduce((sum, item) => sum + parseFloat(item.price.amount), 0)
          .toFixed(2),
        orderDate: order.createdAt,
        buyerData: {
          name: `${order.buyer.firstName} ${order.buyer.lastName}`,
          allegroLogin: order.buyer.login as string,
          companyName: order.buyer.companyName || undefined,
          street: order.delivery?.address?.street || "",
          city: order.delivery?.address?.city || "",
          zipCode: order.delivery?.address?.zipCode || "",
          country: "Polska",
        },
      };

      const response = await axios.post("/api/allegro/returns/return-form", {
        ...returnFormData,
      });
      const { url, filePath } = response.data;
      if (!filePath || !url) {
        throw new Error("Nie udało się wygenerować dokumentu zwrotu wpłaty");
      }
      window.open(url, "_blank");

      showToast("Dokument zostanie pobrany", "success");
    } catch (error) {
      handleError(error, "Błąd podczas generowania dokumentu zwrotu wpłaty");
    } finally {
      stopLoading();
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
    // Kolumna dla filtrowania po statusie
    {
      accessorKey: "status",
      header: "Status",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: (row, columnId, filterValue) => {
        if (!filterValue) return true;
        return row.getValue(columnId) === filterValue;
      },
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

  const usefulStatuses = [
    "CREATED",
    "DISPATCHED",
    "IN_TRANSIT",
    "DELIVERED",
    "FINISHED",
    "REJECTED",
    "COMISSION_REFUNDED",
  ];
  const filteredStatuses = Object.entries(returnStatusTranslations).filter(
    ([key]) => usefulStatuses.includes(key)
  );

  // Opcje statusów do filtrowania
  const statusOptions = [
    { name: "Wszystkie statusy", value: "ALL" },
    ...filteredStatuses.map(([key, value]) => ({
      name: value,
      value: key,
    })),
  ];

  // Funkcja do obsługi zmiany filtru statusu
  const handleStatusFilterChange = (status: string) => {
    setStatusFilter(status);
    setColumnFilters((prev) => [
      ...prev.filter((filter) => filter.id !== "status"),
      ...(status !== "ALL" ? [{ id: "status", value: status }] : []),
    ]);
  };

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
        status: false,
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
      {/* Pole wyszukiwania i filtry */}
      <div className="flex flex-col sm:flex-row gap-4 py-4">
        <Input
          placeholder="Szukaj zwrotów"
          value={globalFilter}
          onChange={(event) => setGlobalFilter(event.target.value)}
          className="max-w-xs"
        />
        <div className="max-w-xs">
          <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
            <SelectTrigger className="w-[250px]">
              <SelectValue placeholder="Filtruj po statusie" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
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
