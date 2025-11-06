import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { UseFormReturn } from "react-hook-form";
import DeliveryMethodSelector from "./DeliveryMethodSelector";
import DeliveryAddressFields from "./DeliveryAddressFields";
import InPostSelector from "./InPostSelector";

export default function SecondStepForm({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  const deliveryMethod = form.watch("deliveryMethod");

  return (
    <div className="flex flex-col gap-8">
      <DeliveryMethodSelector form={form} />
      {deliveryMethod === "courier" && <DeliveryAddressFields form={form} />}
      {deliveryMethod === "parcelLocker" && <InPostSelector form={form} />}
    </div>
  );
}
