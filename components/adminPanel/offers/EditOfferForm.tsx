"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  EditOfferFormSchema,
  Offer,
  OfferWithId,
} from "@/firebase/schemas/offersSchemas";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SellingPricesField from "./SellingPricesField";

export type EditOfferFormValues = Pick<
  Offer,
  "title" | "sellingPrices" | "shippingRates" | "availability"
>;

export default function EditOfferForm({
  oldOfferData,
  productData,
}: {
  oldOfferData: OfferWithId;
  productData: ProductWithId;
}) {
  const form = useForm<EditOfferFormValues>({
    resolver: zodResolver(EditOfferFormSchema),
    defaultValues: {
      title: oldOfferData.title || "",
      sellingPrices: oldOfferData.sellingPrices || {},
      shippingRates: oldOfferData.shippingRates || {},
      availability: oldOfferData.availability || {},
    },
  });

  return (
    <Form {...form}>
      <FormField
        control={form.control}
        name={"title" as const}
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tytuł oferty</FormLabel>
            <Input type="text" value={field.value} onChange={field.onChange} />
          </FormItem>
        )}
      />
      <SellingPricesField />
    </Form>
  );
}
