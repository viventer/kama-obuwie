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
import { Input } from "@/components/ui/input";

import AddColorVariants from "./AddColorVariants";

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
      colorVariants: oldData.colorVariants || [],
      samplePhoto: oldData.samplePhoto || "",
    },
  });

  return (
    <>
      <SubpageHeading text="Utwórz produkt" />
      <div className="max-w-[300px] flex flex-col gap-4">
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
          <FormField
            control={form.control}
            name="brand"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marka</FormLabel>
                <FormControl>
                  <Input type="text" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="manufacturerCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod producenta</FormLabel>
                <FormControl>
                  <Input type="text" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cena zakupu</FormLabel>
                <FormControl>
                  <Input type="number" />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colorVariants"
            render={({ field }) => (
              <AddColorVariants value={field.value} onChange={field.onChange} />
            )}
          />
        </Form>
      </div>
    </>
  );
}
