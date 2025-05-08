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
import { useConfirmDialog } from "../global/ConfirmDialogProvider";

export default function ProductCreateForm({
  oldData,
}: {
  oldData?: ProductWithId;
}) {
  const { productType } = useProductTypeContext();
  const { showToast } = useToast();
  const router = useRouter();

  const form = useForm<ProductWithId>({
    defaultValues: {
      brand: oldData?.brand || "",
      manufacturerCode: oldData?.manufacturerCode || "",
      purchasePrice: oldData?.purchasePrice || 0,
      colorVariants: oldData?.colorVariants || [],
      samplePhoto: oldData?.samplePhoto || "",
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
    data.productType = productType;
    try {
      if (oldData) {
        const resp = await axios.patch(`/api/products/${oldData.id}`, data);
        if (resp.status !== 200) {
          throw new Error("Nie udało się edytować produktu.");
        }
      } else {
        const resp = await axios.post("/api/products", data);
        if (resp.status !== 201) {
          throw new Error("Nie udało się utworzyć produktu.");
        }
      }
      showToast("Produkt został pomyślnie utworzony.", "success");
      router.push("/admin-panel/create-products/new");
    } catch (error) {
      showToast(`Wystąpił błąd podczas tworzenia produktu: ${error}`, "error");
    }
  };

  const { showDialog } = useConfirmDialog();
  const handleReject = async (e: FormEvent) => {
    e.preventDefault();

    showDialog({
      message: "Czy na pewno chcesz odrzucić zmiany?",
      description: "Ta operacja jest nieodwracalna.",
      onConfirm: async () => {
        router.back();
        showToast("Zmiany zostały odrzucone.", "success");
      },
    });
  };

  const areColorVariantsValid =
    colorVariants &&
    colorVariants.length == 0 &&
    colorVariants[0]?.color === "";

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
          {productType === "obuwie" ? (
            <FormField
              control={form.control}
              name="colorVariants"
              rules={{
                required:
                  "Przynajmniej jeden wariant kolorystyczny jest wymagany.",
              }}
              render={({ field }) => (
                <AddColorVariants
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          ) : null}
          <div className="flex mt-8 gap-4">
            <Button
              onClick={(e) => handleSubmit(e)}
              className="w-fit"
              disabled={
                !form.formState.isValid ||
                (productType === "obuwie" && !areColorVariantsValid) ||
                purchasePrice <= 0
              }
            >
              Zapisz
            </Button>
            <Button
              onClick={(e) => handleReject(e)}
              className="w-fit"
              variant="destructive"
            >
              Odrzuć
            </Button>
          </div>
        </Form>
      </div>
    </>
  );
}
