import {
  FulfillmentStatus,
  Order,
  OrderPhase,
  OrderWithId,
} from "@/firebase/schemas/ordersSchemas";
import { TableAction } from "@/lib/dataTableColumns";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getImageUrl } from "@/server-actions/files/files";
import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";
import { SendOrderEmailPayload } from "@/server-actions/emails/orderEmails";
import { transformOrderToEmailOrderData } from "@/helpers/orders";

export type OrderActions = {
  [key in OrderPhase]: TableAction[];
};

export const useOrderActions = (orderPhase: OrderPhase) => {
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();
  const router = useRouter();

  const sendUpdateEmail = async (newPhase: OrderPhase, order: OrderWithId) => {
    if (newPhase === "sent") {
      const emailPayload: SendOrderEmailPayload = {
        templateName: "orderSent",
        to: order.buyer.email,
        subject: `Twoje zamówienie #${order.number} zostało wysłane`,
        emailOrderData: transformOrderToEmailOrderData(order),
      };

      await axios.post("/api/email/send", emailPayload);
    } else if (newPhase === "cancelled") {
      const emailPayload: SendOrderEmailPayload = {
        templateName: "orderCancelled",
        to: order.buyer.email,
        subject: `Twoje zamówienie #${order.number} zostało anulowane`,
        emailOrderData: transformOrderToEmailOrderData(order),
      };

      await axios.post("/api/email/send", emailPayload);
    }
  };

  const createLabelRedirect = (isFromAllegro: boolean, orderId: string) => {
    const createLabelUrl = isFromAllegro
      ? `/admin-panel/orders/allegro/create-label/${orderId}`
      : `/admin-panel/orders/create-label/${orderId}`;

    router.push(createLabelUrl);
  };

  const sendRefundRedirect = (order: OrderWithId) => {
    if (
      !order.allegroPayment?.paidAmount ||
      !order.allegroPayment?.id ||
      (order?.refund?.type && order.refund.type !== "NONE") ||
      order.allegroPayment.type === "CASH_ON_DELIVERY"
    ) {
      showToast("Brak wpłaty do zwrotu", "default");
      router.refresh();
      return;
    }
    router.push(`/admin-panel/orders/send-refund/${order.id}`);
  };

  const changeOrderPhase = async (
    id: string | undefined,
    newPhase: OrderPhase
  ) => {
    try {
      const updateData: Partial<Order> = {
        fulfillment: {
          status: newPhase.toUpperCase() as FulfillmentStatus,
        },
      };
      await axios.patch(`/api/orders/${id}`, updateData);

      const order = await axios.get(`/api/orders/${id}`);
      if (newPhase == "cancelled" || newPhase == "sent") {
        await sendUpdateEmail(newPhase, order.data);
      }

      const salesChannel = order.data.salesChannel;
      const allegroOrderId = order.data.allegroId;

      const isFromAllegro =
        ["AL1", "AL2"].includes(salesChannel) && allegroOrderId;

      if (isFromAllegro) {
        await axios.put(`/api/allegro/orders/status/${allegroOrderId}`, {
          status: newPhase.toUpperCase(),
          account: salesChannel,
        });
      }
      if (newPhase === "processing" && !order.data.shipment?.isCreated) {
        createLabelRedirect(isFromAllegro, id!);
      } else if (newPhase === "cancelled") {
        sendRefundRedirect(order.data);
      }

      showToast("Status zamówienia został zaktualizowany", "success");
    } catch (err) {
      showToast(`Błąd podczas zmiany statusu zamówienia: ${err}`, "error");
    }
  };

  const refundAction: TableAction = {
    name: "Zwróć wpłatę",
    onClick: async (id) => {
      const { data } = await axios.get(`/api/orders/${id}`);
      if (
        !data.allegroPayment?.paidAmount ||
        !data.allegroPayment?.id ||
        (data?.refund?.type && data.refund.type !== "NONE")
      ) {
        showToast("Brak wpłaty do zwrotu", "error");
        return;
      }

      router.push(`/admin-panel/orders/send-refund/${id}`);
    },
  };

  const cancelOrderAction: TableAction = {
    name: "Odrzuć",
    onClick: async (id) => {
      try {
        await changeOrderPhase(id, "cancelled");
      } catch (err) {
        showToast(`Błąd podczas odrzucania zamówienia: ${err}`, "error");
      }
    },
  };

  const downloadRefundDocumentAction: TableAction = {
    name: "Potwierdzenie zwrotu wpłaty",
    onClick: async (id) => {
      startLoading();
      const order = await axios.get(`/api/orders/${id}`);
      const filePath = order.data.refund?.refundDocument?.filePath;
      if (!filePath) {
        showToast("Brak potwierdzenia zwrotu wpłaty.", "error");
        stopLoading();
        return;
      }
      const url = await getImageUrl(filePath);
      if (!url) {
        showToast("Nie udało się pobrać potwierdzenia zwrotu wpłaty.", "error");
        stopLoading();
        return;
      }

      window.open(url, "_blank");

      stopLoading();
      router.refresh();
    },
  };

  const downloadShippingLabelAction: TableAction = {
    name: "Pobierz etykietę przesyłki",
    onClick: async (id) => {
      startLoading();
      try {
        const response = await axios.get(
          `/api/orders/shipment-management/label/${id}`
        );

        if (response.data.url) {
          window.open(response.data.url, "_blank");
          showToast("Etykieta przesyłki została otwarta", "success");
        } else {
          showToast("Nie udało się pobrać etykiety przesyłki", "error");
        }
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          "Wystąpił błąd podczas pobierania etykiety";
        showToast(errorMessage, "error");
      } finally {
        stopLoading();
      }
    },
  };

  const newActions: TableAction[] = [
    {
      name: "Zatwierdź",
      onClick: async (id) => {
        await changeOrderPhase(id, "processing");
        showToast("Zamówienie zatwierdzone", "success");
      },
    },
    cancelOrderAction,
    refundAction,
    downloadRefundDocumentAction,
  ];

  const processingActions: TableAction[] = [
    {
      name: "Oznacz jako gotowe do wysyłki",
      onClick: async (id) => {
        const { data } = await axios.get(`/api/orders/${id}`);
        if (!data.invoice?.isAdded && data.invoice?.required) {
          showToast(
            "Aby przenieść zamówienie do kolejnego etapu, dodaj fakturę.",
            "error"
          );
          return;
        }
        if (!data.shipment?.isCreated) {
          showToast(
            "Aby przenieść zamówienie do kolejnego etapu, utwórz przesyłkę.",
            "error"
          );
          return;
        }
        await changeOrderPhase(id, "ready_for_shipment");
        showToast(
          "Zamówienie zostało przeniesione do kolejnego etapu.",
          "success"
        );
        router.refresh();
      },
    },
    downloadShippingLabelAction,
    cancelOrderAction,
    refundAction,
    downloadRefundDocumentAction,
  ];

  const readyForShipmentActions: TableAction[] = [
    {
      name: "Oznacz jako wysłane",
      onClick: async (id) => {
        await changeOrderPhase(id, "sent");
        showToast(
          "Zamówienie zostało przeniesione do kolejnego etapu.",
          "success"
        );
        router.refresh();
      },
    },
    {
      name: "Cofnij do realizacji",
      onClick: async (id) => {
        await changeOrderPhase(id, "processing");
        showToast(
          "Zamówienie zostało cofnięte do poprzedniego etapu.",
          "success"
        );
        router.refresh();
      },
    },
    downloadShippingLabelAction,
    cancelOrderAction,
    refundAction,
    downloadRefundDocumentAction,
  ];

  const sentActions: TableAction[] = [
    {
      name: "Cofnij do gotowe do wysyłki",
      onClick: async (id) => {
        await changeOrderPhase(id, "ready_for_shipment");
        showToast("Etap realizacji zamówienia został cofnięty.", "success");
        router.refresh();
      },
    },
  ];

  const cancelledActions: TableAction[] = [
    {
      name: "Przenieś do realizacji",
      onClick: async (id) => {
        // sprawdź czy wszystkie środki zostały zwrócone, jeśli tak - nie przenoś do realizacji
        await changeOrderPhase(id, "processing");
        showToast("Zamówienie zostało przeniesione do realizacji.", "success");
        router.refresh();
      },
    },

    refundAction,
    downloadRefundDocumentAction,
  ];

  const actions: OrderActions = {
    unpaid: [],
    new: newActions,
    processing: processingActions,
    ready_for_shipment: readyForShipmentActions,
    sent: sentActions,
    cancelled: cancelledActions,
  };

  return actions[orderPhase];
};
