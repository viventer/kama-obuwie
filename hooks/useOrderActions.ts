import { OrderPhase } from "@/firebase/schemas/ordersSchemas";
import { TableAction } from "../lib/dataTableColumns";
import { useToast } from "@/hooks/useToast";
import { useRouter } from "next/navigation";

export type OrderActions = {
  [key in OrderPhase]: TableAction[];
};

export const useOrderActions = () => {
  const { showToast } = useToast();
  const router = useRouter();
  const actions: OrderActions = {
    new: [],
    processing: [],
    readyForShipment: [],
    sent: [],
    cancelled: [],
  };

  return actions;
};
