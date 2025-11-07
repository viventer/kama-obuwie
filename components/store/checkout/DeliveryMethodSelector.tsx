import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { UseFormReturn } from "react-hook-form";

export default function DeliveryMethodSelector({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  return (
    <FormField
      control={form.control}
      name="deliveryMethod"
      render={({ field }) => (
        <FormItem className="max-w-2xs">
          <h2 className="text-xl mb-1">Metoda dostawy</h2>
          <RadioGroup onValueChange={field.onChange} value={field.value}>
            <div
              className={`flex items-center gap-2 border-2 px-2 py-1 rounded-sm transition-colors ${
                field.value === "courier" ? "border-brand" : "border-border"
              }`}
            >
              <FormControl>
                <RadioGroupItem value={"courier"} id="courier" />
              </FormControl>
              <Label htmlFor="courier" className="text-lg">
                InPost Kurier
              </Label>
            </div>
            <div
              className={`flex items-center gap-2 border-2 px-2 py-1 rounded-sm transition-colors ${
                field.value === "parcelLocker"
                  ? "border-brand"
                  : "border-border"
              }`}
            >
              <FormControl>
                <RadioGroupItem value={"parcelLocker"} id="parcelLocker" />
              </FormControl>
              <Label htmlFor="parcelLocker" className="text-lg">
                InPost Paczkomat 24/7
              </Label>
            </div>
          </RadioGroup>
          <FormMessage className="text-text" />
        </FormItem>
      )}
    />
  );
}
