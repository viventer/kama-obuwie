import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { TruckIcon, WalletIcon } from "lucide-react";
import DeliveryAndReturnsDialogContent from "./DeliveryAndReturnsDialogContent";
import DeliveryAndPaymentMethodsDialogContent from "./DeliveryAndPaymentMethodsDialogContent";

export default function MobileProductPageShopAdvantages({
  className,
}: {
  className?: string;
}) {
  const { openDialog, closeDialog } = useDialogWindow();

  const openModal = (type: "deliveryCost" | "deliveryAndPayment") => {
    switch (type) {
      case "deliveryCost":
        openDialog({
          title: "Dostawa i zwroty",
          content: <DeliveryAndReturnsDialogContent />,
          hasCancelButton: false,
          confirmText: "Wróć do zakupów",
          onConfirm: closeDialog,
          confirmVariant: "important",
        });
        break;
      case "deliveryAndPayment":
        openDialog({
          title: "Metody dostaw i płatności",
          content: <DeliveryAndPaymentMethodsDialogContent />,
          hasCancelButton: false,
          confirmText: "Wróć do zakupów",
          onConfirm: closeDialog,
          confirmVariant: "important",
        });
        break;
      default:
        break;
    }
  };

  return (
    <section className={cn("flex flex-col border-t-1 border-b-1", className)}>
      <article className="flex gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <TruckIcon className="size-4 text-success" />
          <p className="font-medium">Dostawa od 0 zł i darmowy zwrot</p>
        </div>
        <Button
          variant="ghost"
          className="px-2 py-1 underline decoration-brand decoration-2"
          onClick={() => openModal("deliveryCost")}
        >
          więcej
        </Button>
      </article>
      <article className="flex gap-2 items-center justify-between">
        <div className="flex items-center gap-2">
          <WalletIcon className="size-4 text-success" />
          <p className="font-medium">Metody płatności i dostawy</p>
        </div>
        <Button
          variant="ghost"
          className="px-2 py-1 underline decoration-brand decoration-2"
          onClick={() => openModal("deliveryAndPayment")}
        >
          więcej
        </Button>
      </article>
    </section>
  );
}
