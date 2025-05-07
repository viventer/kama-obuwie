"use client";

import { Product, ProductWithId } from "@/firebase/schemas/productsSchemas";
import { useForm } from "react-hook-form";
import ImageUploader from "../global/ImageUploader";
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
import { Button } from "@/components/ui/button";
import { FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

export default function ProductCreateForm() {
  const { productType } = useProductTypeContext();
  const { showToast } = useToast();
  const router = useRouter();

  const form = useForm<ProductWithId>({
    defaultValues: {
      brand: "",
      manufacturerCode: "",
      purchasePrice: 0,
      colorVariants: [],
      samplePhoto: "",
      creationStage: "new",
      productType: productType,
    },
  });

  const colorVariants = form.watch("colorVariants");
  const purchasePrice = form.watch("purchasePrice");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data: Product = form.getValues();
    data.purchasePrice = Number(data.purchasePrice);
    try {
      const resp = await axios.post("/api/products", data);
      if (resp.status !== 201) {
        throw new Error("Nie udało się utworzyć produktu.");
      }
      showToast("Produkt został pomyślnie utworzony.", "success");
      router.push("/admin-panel/create-products/new");
    } catch (error) {
      showToast(`Wystąpił błąd podczas tworzenia produktu: ${error}`, "error");
    }
  };

  return (
    <>
      <SubpageHeading text="Utwórz produkt" />
      <div className="max-w-[300px] flex flex-col gap-4">
        <Form {...form}>
          <FormField
            rules={{ required: "Zdjęcie poglądowe jest wymagane" }}
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
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            rules={{ required: "Kod producenta jest wymagany." }}
            name="manufacturerCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kod producenta</FormLabel>
                <FormControl>
                  <Input type="text" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="purchasePrice"
            rules={{ required: "Cena zakupu jest wymagana." }}
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cena zakupu</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={field.value}
                    onChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colorVariants"
            rules={{
              required:
                "Przynajmniej jeden wariant kolorystyczny jest wymagany.",
            }}
            render={({ field }) => (
              <AddColorVariants value={field.value} onChange={field.onChange} />
            )}
          />
          <Button
            onClick={(e) => handleSubmit(e)}
            className="w-fit mt-8"
            disabled={
              !form.formState.isValid ||
              !colorVariants ||
              colorVariants[0].color === "" ||
              purchasePrice <= 0
            }
          >
            Utwórz
          </Button>
        </Form>
      </div>
    </>
  );
}
