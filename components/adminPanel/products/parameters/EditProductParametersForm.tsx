"use client";

import {
  CategoryWithId,
  Product,
  ProductWithId,
  RangeSize,
} from "@/firebase/schemas/productsSchemas";
import { useProductTypeContext } from "../ProductsTypeContext";
import { useToast } from "@/hooks/useToast";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import AddColorVariants from "../AddColorVariants";
import { Button } from "@/components/ui/button";
import { useConfirmDialog } from "../../global/ConfirmDialogProvider";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CategorySelector from "../categories/CategorySelector";
import RootCategorySelector from "../categories/RootCategorySelector";
import SizingTableSelector from "../sizing-tables/SizingTableSelector";
import ImageUploader from "../../global/uploaders/ImageUploader";
import AllegroParametersSection from "./AllegroParametersSection";
import { DocumentDataWithRef } from "@/server-actions/helpers";
import RangeSizesFormItem, { RangeSizeString } from "./RangeSizesFormItem";
import MatchingCategoriesSelector from "../categories/MatchingCategoriesSelector";

export default function EditProductParametersForm({
  oldData,
}: {
  oldData: ProductWithId;
}) {
  const { productType, setProductType } = useProductTypeContext();
  const { showToast } = useToast();
  const router = useRouter();

  type FormData = Omit<Product, "rangeSizes"> & {
    rangeSizes: RangeSizeString[];
  };

  useEffect(() => {
    setProductType(oldData.productType);
  }, [oldData]);

  const form = useForm<FormData>({
    defaultValues: {
      brand: oldData.brand || "",
      manufacturerCode: oldData.manufacturerCode || "",
      purchasePrice: oldData.purchasePrice || 0,
      suggestedPrice: oldData.suggestedPrice || 0,
      colorVariants: oldData.colorVariants || [],
      samplePhoto: oldData.samplePhoto || "",
      creationStage: oldData.creationStage || "new",
      productType: productType,
      warrantyPeriod: oldData.warrantyPeriod || 0,
      categoryId: oldData.categoryId,
      sizingTableId: oldData.sizingTableId || "",
      parameters: oldData?.parameters
        ? {
            required: oldData.parameters.required || {},
            optional: oldData.parameters.optional || {},
          }
        : { required: {}, optional: {} },
      rootCategory: oldData.rootCategory,
      rangeSizes: oldData.rangeSizes
        ? oldData.rangeSizes.map((rs) => ({
            from: String(rs.from),
            to: String(rs.to),
          }))
        : [{ from: "0", to: "0" }],
      matchingCategoriesIds: oldData.matchingCategoriesIds || [],
      features: oldData.features || [],
      otherInfo: oldData.otherInfo || "",
    },
    mode: "onSubmit",
  });

  const categoryId = form.watch("categoryId");
  const rootCategory = form.watch("rootCategory");
  const [allegroCategoryId, setAllegroCategoryId] = useState<
    string | undefined
  >(undefined);

  useEffect(() => {
    if (!categoryId) return;

    (async function () {
      const { data } = await axios.get<DocumentDataWithRef<CategoryWithId>>(
        `/api/categories/${categoryId}`
      );
      if (!data?.data) {
        showToast("Błąd pobierania kategorii.", "error");
        return;
      }
      const newAllegroCategoryId = data.data.allegroCategoryId;
      setAllegroCategoryId(newAllegroCategoryId);
    })();
  }, [categoryId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    const purchasePriceNum = Number(data.purchasePrice);
    const suggestedPriceNum = Number(data.suggestedPrice);
    const warrantyPeriodNum = Number(data.warrantyPeriod);

    const rangeSizesNum: RangeSize[] = (data.rangeSizes || []).map((rs) => ({
      from: Number(rs.from),
      to: Number(rs.to),
    }));

    const payload: Product = {
      ...data,
      purchasePrice: purchasePriceNum,
      suggestedPrice: suggestedPriceNum,
      warrantyPeriod: warrantyPeriodNum,
      productType,
      rangeSizes: rangeSizesNum,
    };

    const hasValidColorVariants =
      productType !== "obuwie" ||
      (data.colorVariants &&
        data.colorVariants.length > 0 &&
        data.colorVariants[0]?.color !== "");
    const pricesValid =
      purchasePriceNum > 0 && suggestedPriceNum > purchasePriceNum;
    const warrantyPeriodValid = warrantyPeriodNum >= 0;

    const isValid = await form.trigger();

    if (
      !isValid ||
      !hasValidColorVariants ||
      !pricesValid ||
      !warrantyPeriodValid
    ) {
      showToast("W formularzu występują błędy.", "error");
      return;
    }

    try {
      if (oldData) {
        const resp = await axios.patch(`/api/products/${oldData.id}`, payload);
        if (resp.status !== 200) {
          throw new Error("Nie udało się edytować produktu.");
        }
      } else {
        throw new Error("Produkt nie istnieje.");
      }
      showToast("Parametry zostały zaaktualizowane.", "success");
      router.push("/admin-panel/create-products/parameters");
    } catch (error) {
      showToast(
        `Wystąpił błąd podczas aktualizacji parametrów: ${error}`,
        "error"
      );
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
        showToast("Zmiany zostały odrzucone.", "default");
      },
    });
  };

  return (
    <div className="flex flex-col gap-4">
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
                  filePath={field.value || ""}
                  setFilePath={field.onChange}
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
                  min={0}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="suggestedPrice"
          rules={{ required: "Sugerowana cena jest wymagana." }}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sugerowana cena sprzedaży</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        {productType === "obuwie" ? (
          <>
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
            <FormField
              control={form.control}
              name="sizingTableId"
              rules={{
                required: "Tabela rozmiarów jest wymagana.",
              }}
              render={({ field }) => (
                <SizingTableSelector
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
          </>
        ) : (
          <FormField
            control={form.control}
            name="rangeSizes"
            rules={{
              required: "Co najmniej jeden zakres jest wymagany",
              validate: {
                atLeastOne: (val) =>
                  (Array.isArray(val) && val.length > 0) ||
                  "Musisz dodać przynajmniej jeden zakres",
                fromLessThanTo: (val) =>
                  val.every((r) => Number(r.from) < Number(r.to)) ||
                  "W każdym zakresie `from` musi być mniejsze niż `to`",
                allIntegers: (val) =>
                  val.every(
                    (r) =>
                      Number.isInteger(Number(r.from)) &&
                      Number.isInteger(Number(r.to))
                  ) || "Wszystkie wartości muszą być liczbami całkowitymi",
                minGreaterThanTen: (val) =>
                  val.every((r) => Number(r.from) > 10 && Number(r.to) > 10) ||
                  "`from` i `to` muszą być większe niż 10",
              },
            }}
            render={({ field }) => (
              <RangeSizesFormItem
                value={field.value}
                onChange={field.onChange}
              />
            )}
          />
        )}
        <FormField
          control={form.control}
          name="warrantyPeriod"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Okres gwarancji</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={0}
                  value={field.value}
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rootCategory"
          rules={{
            required: "Kategoria główna jest wymagana.",
          }}
          render={({ field }) => (
            <RootCategorySelector
              value={field.value}
              onChange={field.onChange}
            />
          )}
        />
        <FormField
          control={form.control}
          name="categoryId"
          rules={{
            required: "Kategoria jest wymagana.",
          }}
          render={({ field }) => (
            <CategorySelector
              value={field.value}
              onChange={field.onChange}
              rootCategory={rootCategory}
              setAllegroCategoryId={setAllegroCategoryId}
            />
          )}
        />

        <FormField
          control={form.control}
          name="matchingCategoriesIds"
          rules={{
            required: "Pasujące kategorie są wymagane.",
          }}
          render={({ field }) => (
            <MatchingCategoriesSelector
              value={field.value as string[]}
              onChange={field.onChange}
              rootCategory={rootCategory}
            />
          )}
        />

        <AllegroParametersSection allegroCategoryId={allegroCategoryId} />

        <div className="flex mt-8 gap-4">
          <Button onClick={(e) => handleSubmit(e)} className="w-fit">
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
  );
}
