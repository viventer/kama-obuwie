import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  CheckoutData,
  paymentMethods,
  paymentMethodsLabels,
} from "@/firebase/schemas/checkoutSchemas";
import { UseFormReturn } from "react-hook-form";

export default function PaymentMethodSelector({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  const deliveryMethod = form.watch("deliveryMethod");
  const filteredPaymentMethods =
    deliveryMethod === "parcelLocker"
      ? paymentMethods.filter((method) => method !== "COD")
      : paymentMethods;

  const activeTab = form.watch("activeTab");

  return (
    <FormField
      control={form.control}
      name="paymentMethod"
      render={({ field }) => (
        <FormItem
          className={`${activeTab != "secondStep" ? "hidden" : ""} max-w-2xs`}
        >
          <h2 className="text-xl mb-1">Metoda płatności</h2>
          <RadioGroup onValueChange={field.onChange} value={field.value}>
            {filteredPaymentMethods.map((method, index) => (
              <div
                className={`flex items-center gap-2 border-2 px-2 py-1 rounded-sm transition-colors ${
                  field.value === method ? "border-brand" : "border-border"
                }`}
                key={index}
              >
                <FormControl>
                  <RadioGroupItem value={method} id={method} />
                </FormControl>
                <Label htmlFor={method} className="text-lg">
                  {paymentMethodsLabels[method]}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <FormMessage className="text-text" />
        </FormItem>
      )}
    />
  );
}
