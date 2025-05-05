"use client";

import {
  ProductWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
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
import { useEffect } from "react";
import { getProductParameters } from "@/server-actions/allegro/products";
import { getAllegroCategories } from "@/server-actions/allegro/categories";
import axios from "axios";
import { useToast } from "@/hooks/useToast";

export default function ProductCreateForm({
  oldData,
}: {
  oldData: ProductWithId;
}) {
  const { productType } = useProductTypeContext();
  const { showToast } = useToast();

  useEffect(() => {
    (async function () {
      const rootCategory: RootCategory =
        productType == "shoes" ? "obuwie męskie" : "akcesoria";
      const resp = await axios.get(`/api/allegro/categories/${rootCategory}`);
      if (resp.status !== 200) {
        showToast("Nie udało się pobrać kategorii.", "error");
        return;
      }

      const categoryId = resp.data[0].id;

      const { data: parameters } = await axios.get(
        `/api/allegro/parameters/${categoryId}`
      );
      if (!parameters) {
        showToast("Nie udało się pobrać parametrów.", "error");
        return;
      }

      console.log("Product parameters", parameters);
    })();
  }, []);

  const form = useForm<ProductWithId>({
    defaultValues: {
      brand: oldData.brand || "",
      manufacturerCode: oldData.manufacturerCode || "",
      purchasePrice: oldData.purchasePrice || 0.0,
      colors: oldData.colors || [],
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
        </Form>
      </div>
    </>
  );
}
