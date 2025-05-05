"use client";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { useForm } from "react-hook-form";
import ImageUploader from "./ImageUploader";
import SubpageHeading from "../global/SubpageHeading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useProductTypeContext } from "./ProductsTypeContext";

export default function ProductCreateForm({
  oldData,
}: {
  oldData: ProductWithId;
}) {
  const { productType } = useProductTypeContext();

  const form = useForm<ProductWithId>({
    defaultValues: {
      brand: oldData.brand || "",
      manufacturerCode: oldData.manufacturerCode || "",
      purchasePrice: oldData.purchasePrice || 0.0,
      colors: oldData.colors || [],
      samplePhoto: oldData.samplePhoto || "",
    },
  });

  const samplePhoto = form.watch("samplePhoto");

  return (
    <>
      <SubpageHeading text="Utwórz produkt" />
      <Form {...form}>
        <FormField
          control={form.control}
          name="samplePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zdjęcie poglądowe</FormLabel>
              <FormControl>
                <ImageUploader
                  fileName={field.value || ""}
                  setFileName={field.onChange}
                  folderPath={`products/sample-photos/${productType}`}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </Form>
    </>
  );
}
