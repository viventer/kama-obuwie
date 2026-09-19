"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { FilePlus2Icon, Mail, MoreHorizontal, PackageIcon } from "lucide-react";
import { Order } from "@/firebase/schemas/ordersSchemas";
import { OrderLineItemDisplay } from "./OrderLineItemDisplay";
import { OrderInfoDisplay } from "./OrderInfoDisplay";
import IconButton from "../../global/IconButton";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import OrderCostDisplay from "./OrderCostDisplay";
import { redirect, useRouter } from "next/navigation";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import ShipmentsDialogContent from "../ShipmentsDialogContent";
import axios from "axios";
import InvoiceInfo from "../InvoiceInfo";
import { useToast } from "@/hooks/useToast";
import { TableAction } from "@/lib/dataTableColumns";

const hiddenSearchColumn = {
  cell: () => null,
  enableSorting: false,
  enableColumnFilter: false,
  size: 0,
  meta: { hidden: true },
} as const;

function OrderRowActions({
  order,
  actions,
}: {
  order: Order;
  actions: TableAction[];
}) {
  const router = useRouter();
  const { openDialog } = useDialogWindow();
  const { showToast } = useToast();

  return (
    <div className="flex items-center gap-2 flex-col">
      {order.messageToSeller?.content && (
        <IconButton
          className={`${
            order.messageToSeller?.isRead
              ? "text-primary"
              : "text-destructive"
          } hover:text-primary`}
          onClick={() =>
            openDialog({
              title: "Wiadomość do sprzedawcy",
              content: <p>{order.messageToSeller?.content}</p>,
              onConfirm: async () => {
                await axios.patch(`/api/orders/${order.id}`, {
                  messageToSeller: {
                    content: order.messageToSeller?.content,
                    isRead: true,
                  },
                });

                router.refresh();
              },
              confirmText: "Ok",
            })
          }
        >
          <Mail className="size-4" />
        </IconButton>
      )}
      {order?.invoice?.required && (
        <IconButton
          className={`${
            order?.invoice?.isAdded ? "text-success" : "text-destructive"
          } hover:text-primary`}
          onClick={() =>
            openDialog({
              title: "Dodaj fakturę",
              content: <InvoiceInfo data={order.invoice} />,
              onConfirm: async () => {
                if (!order.invoice?.isAdded) {
                  await axios.patch(`/api/orders/${order.id}`, {
                    invoice: {
                      ...order.invoice,
                      sendingMethod: "inBox",
                      isAdded: true,
                    },
                  });
                  router.refresh();
                  showToast("Faktura została dodana", "success");
                }
              },
              confirmText: order.invoice?.isAdded
                ? "Zamknij"
                : "Oznacz jako dodaną",
              cancelText: "Anuluj",
              hasCancelButton: true,
            })
          }
        >
          <FilePlus2Icon className="size-4" />
        </IconButton>
      )}
      {order.fulfillment?.status !== "NEW" &&
        order.fulfillment?.status !== "CANCELLED" && (
          <IconButton
            className={`${
              order?.shipment?.isCreated ? "text-success" : "text-destructive"
            } hover:text-primary`}
            onClick={async () => {
              if (order?.shipment?.isCreated) {
                openDialog({
                  title: "Informacje o wysyłce",
                  content: (
                    <ShipmentsDialogContent
                      shipmentData={order?.shipment}
                      orderId={order.id as string}
                    />
                  ),
                });
                return;
              }

              if (order.salesChannel.includes("AL")) {
                let returnsForOrder;
                try {
                  const { data } = await axios.get(
                    `/api/allegro/returns?allegroOrderId=${order.allegroId}`,
                  );
                  returnsForOrder = data;
                } catch (err) {
                  redirect("/admin-auth/allegro-connect");
                }

                if (
                  returnsForOrder.AL1.length > 0 ||
                  returnsForOrder.AL2.length > 0
                ) {
                  openDialog({
                    title: "Zamówienie ma zwroty",
                    content: (
                      <p>
                        Do tego zamówienia został już zgłoszony zwrot. Czy na
                        pewno chcesz wygenerować etykietę?
                      </p>
                    ),
                    cancelText: "Anuluj tworzenie etykiety",
                    hasCancelButton: true,
                    onCancel: () => {
                      showToast(
                        "Etykieta nie została wygenerowana.",
                        "default",
                      );
                      router.back();
                      return;
                    },
                  });
                }

                router.push(
                  `/admin-panel/orders/allegro/create-label/${order.id}`,
                );
              }

              router.push(`/admin-panel/orders/create-label/${order.id}`);

              return;
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
              onClick={() => action.onClick(order.id)}
            >
              {action.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function getOrdersColumns(actions: TableAction[]): ColumnDef<Order>[] {
  return [
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
      accessorKey: "number",
      header: "Numer",
      ...hiddenSearchColumn,
    },
    {
      accessorFn: (row) => row.buyer.firstName,
      id: "buyerFirstName",
      header: "Imię",
      ...hiddenSearchColumn,
    },
    {
      accessorFn: (row) => row.buyer.lastName,
      id: "buyerLastName",
      header: "Nazwisko",
      ...hiddenSearchColumn,
    },
    {
      accessorFn: (row) => row.buyer.phoneNumber,
      id: "buyerPhone",
      header: "Telefon",
      ...hiddenSearchColumn,
    },
    {
      accessorFn: (row) => row.buyer.login,
      id: "buyerLogin",
      header: "Login",
      ...hiddenSearchColumn,
    },
    {
      accessorFn: (row) =>
        row.lineItems.map((item) => item.offer.signature).join(" "),
      id: "signatures",
      header: "Sygnatury",
      ...hiddenSearchColumn,
    },
    {
      accessorKey: "salesChannel",
      id: "salesChannel",
      header: "Kanał",
      cell: () => null,
      enableSorting: false,
      enableColumnFilter: true,
      filterFn: "equalsString",
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
        <OrderRowActions order={row.original} actions={actions} />
      ),
      enableSorting: false,
      enableHiding: false,
    },
  ];
}
