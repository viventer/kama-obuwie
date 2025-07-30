import {
  AllegroOrderStatus,
  FulfillmentStatus,
  Order,
  OrderPhase,
} from "@/firebase/schemas/ordersSchemas";
import { TableAction } from "../lib/dataTableColumns";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";
import axios from "axios";

export type OrderActions = {
  [key in OrderPhase]: TableAction[];
};

export const useOrderActions = (orderPhase: OrderPhase) => {
  const { showToast } = useToast();
  const router = useRouter();

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
    } catch (err) {
      showToast(`Błąd podczas zmiany statusu zamówienia: ${err}`, "error");
    }
  };

  const refundAction: TableAction = {
    name: "Zwróć część wpłaty",
    onClick: async (id) => {
      const { data } = await axios.get(`/api/orders/${id}`);
      if (
        !data.payment?.paidAmount ||
        !data.payment?.id ||
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
        const updateData: Partial<Order> = {
          fulfillment: {
            status: "CANCELLED",
          },
        };
        await axios.patch(`/api/orders/${id}`, updateData);
        showToast("Zamówienie odrzucone", "default");
        router.push(`/admin-panel/orders/send-refund/${id}`);
      } catch (err) {
        showToast(`Błąd podczas odrzucania zamówienia: ${err}`, "error");
      }
    },
  };

  const newActions: TableAction[] = [
    {
      name: "Zatwierdź",
      onClick: async (id) => {
        await changeOrderPhase(id, "processing");
        showToast("Zamówienie zatwierdzone", "success");
        router.refresh();
        // server action do utworzenia przesyłki
      },
    },
    cancelOrderAction,
    refundAction,
  ];

  const processingActions: TableAction[] = [
    {
      name: "Oznacz jako gotowe do wysyłki",
      onClick: async (id) => {
        await changeOrderPhase(id, "ready_for_shipment");
        showToast(
          "Zamówienie zostało przeniesione do kolejnego etapu.",
          "success"
        );
        router.refresh();
      },
    },
    cancelOrderAction,
    refundAction,
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
    cancelOrderAction,
    refundAction,
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
  ];

  const actions: OrderActions = {
    new: newActions,
    processing: processingActions,
    ready_for_shipment: readyForShipmentActions,
    sent: sentActions,
    cancelled: cancelledActions,
  };

  return actions[orderPhase];
};
