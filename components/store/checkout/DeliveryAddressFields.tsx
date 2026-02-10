import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CheckoutData } from "@/firebase/schemas/checkoutSchemas";
import { UseFormReturn } from "react-hook-form";

export default function DeliveryAddressFields({
  form,
}: {
  form: UseFormReturn<CheckoutData>;
}) {
  return (
    <section className="flex flex-col gap-4 border-1 px-4 py-3 rounded-xs max-w-2xl">
      <h2 className="text-xl mb-1 font-medium">Adres dostawy</h2>
      <div className="flex gap-4 flex-wrap w-full">
        <FormField
          control={form.control}
          name="address.postalCode"
          render={({ field }) => (
            <FormItem className="flex-2 min-w-[130px]">
              <FormLabel>
                Kod pocztowy{" "}
                <span className="text-destructive text-lg">&bull;</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-text" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.city"
          render={({ field }) => (
            <FormItem className="flex-7 min-w-[230px]">
              <FormLabel>
                Miejscowość{" "}
                <span className="text-destructive text-lg">&bull;</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-text" />
            </FormItem>
          )}
        />
      </div>
      <div className="flex gap-4 flex-wrap w-full">
        <FormField
          control={form.control}
          name="address.street"
          render={({ field }) => (
            <FormItem className="flex-5 min-w-[230px]">
              <FormLabel>
                Ulica <span className="text-destructive text-lg ">&bull;</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-text" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.buildingNumber"
          render={({ field }) => (
            <FormItem className="flex-2  min-w-[130px]">
              <FormLabel>
                Nr budynku{" "}
                <span className="text-destructive text-lg">&bull;</span>
              </FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-text" />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="address.apartmentNumber"
          render={({ field }) => (
            <FormItem className="flex-2 min-w-[130px]">
              <FormLabel>Nr mieszkania</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage className="text-text" />
            </FormItem>
          )}
        />
      </div>
      <p>
        <span className="text-destructive text-lg mr-1">&bull;</span> Pole
        wymagane
      </p>
    </section>
  );
}
