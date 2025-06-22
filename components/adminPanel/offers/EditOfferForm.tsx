"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  EditOfferFormSchema,
  Offer,
  OfferWithId,
} from "@/firebase/schemas/offersSchemas";
import {
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import SellingPricesField from "./SellingPricesField";
import ShippingRatesSelector from "./ShippingRatesSelector";
import AvailabilityField from "./AvailabilityField";
import { useEffect, useState } from "react";
import axios from "axios";

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
  const [sizes, setSizes] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      const { data }: { data: SizingTableWithId } = await axios.get(
        `/api/sizing-tables/${productData.sizingTableId}`
      );
      const respSizes = data.insoleLengths.map((item) => item.size.toString());
      setSizes(respSizes);

      respSizes.forEach((size) => {
        const current = form.getValues(`availability.${size}.value`);
        if (current == null) {
          form.setValue(`availability.${size}.value`, 1);
        }
      });
    })();
  }, [productData.sizingTableId]);

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
      <div className="flex flex-col gap-4">
        <FormField
          control={form.control}
          name={"title" as const}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tytuł oferty</FormLabel>
              <Input
                type="text"
                value={field.value}
                onChange={field.onChange}
              />
            </FormItem>
          )}
        />
        <SellingPricesField />
        <ShippingRatesSelector />
        <AvailabilityField sizes={sizes} />
      </div>
    </Form>
  );
}
