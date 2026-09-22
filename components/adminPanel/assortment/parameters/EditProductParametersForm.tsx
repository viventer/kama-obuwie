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
import { useConfirmDialog } from "../../../../app/providers/ConfirmDialogProvider";
import { FormEvent, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";
import CategorySelector from "../categories/CategorySelector";
import RootCategorySelector from "../categories/RootCategorySelector";
import SizingTableSelector from "../sizing-tables/SizingTableSelector";
import ImageUploader from "../../global/uploaders/ImageUploader";
import AllegroParametersSection from "./AllegroParametersSection";
import { DocumentDataWithRef } from "@/firebase/getters";
import RangeSizesFormItem, { RangeSizeString } from "./RangeSizesFormItem";
import MatchingCategoriesSelector from "../categories/MatchingCategoriesSelector";
import MultipleSearchSelect from "../../global/form/MultipleSearchSelect";
import { availableProductFeatures } from "@/lib/constants";
import TextEditor from "../description/TextEditor";
import ResponsibleProducerSelector from "./ResponsibleProducerSelector";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useFullPageLoading } from "../../global/FullPageLoader";
import { formatAllegroProductParameters } from "@/server-actions/allegro/offers";
import {
  AllegroOffer,
  Offer,
  AllegroOfferParameters,
} from "@/firebase/schemas/offersSchemas";
import { AllegroProductParametersResponse } from "@/server-actions/allegro/products";

export type ProductParametersFormData = Omit<Product, "rangeSizes"> & {
  rangeSizes: RangeSizeString[];
};

export default function EditProductParametersForm({
  oldData,
}: {
  oldData: ProductWithId;
}) {
  const { productType, setProductType } = useProductTypeContext();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { startLoading, stopLoading } = useFullPageLoading();
  const router = useRouter();
  const isDone = oldData.creationStage === "done";

  useEffect(() => {
    setProductType(oldData.productType);
  }, [oldData]);

  const form = useForm<ProductParametersFormData>({
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
      responsibleProducer: oldData.responsibleProducer || {},
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
        `/api/categories/${categoryId}`,
      );
      if (!data?.data) {
        showToast("Błąd pobierania kategorii.", "error");
        return;
      }
      const newAllegroCategoryId = data.data.allegroCategoryId;
      setAllegroCategoryId(newAllegroCategoryId);
    })();
  }, [categoryId]);

  const editAllegroOfferParams = async (
    formData: ProductParametersFormData,
  ) => {
    startLoading();

    if (!allegroCategoryId) {
      showToast("Kategoria Allegro jest wymagana.", "error");
      stopLoading();
      return;
    }

    const { data: availableAllegroParameters } =
      await axios.get<AllegroProductParametersResponse>(
        `/api/allegro/parameters/${allegroCategoryId}`,
      );

    const parametersNames = Object.values(availableAllegroParameters).map((p) =>
      p.name.toLowerCase(),
    );

    try {
      const formattedParameters = await formatAllegroProductParameters(
        {
          productParameters: formData.parameters,
          allegroCategoryId,
        },
        parametersNames,
      );

      // Pobierz SKU dla wszystkich wariantów kolorystycznych
      const allSKUs = oldData.SKU ? Object.values(oldData.SKU) : [];

      if (allSKUs.length === 0) {
        throw new Error("Brak SKU dla wariantów kolorystycznych");
      }

      // Pobierz oferty dla wszystkich wariantów kolorystycznych
      const offersPromises = allSKUs.map(async (sku) => {
        const response = await axios.get(`/api/offers?SKU=${sku}`);
        return Object.values(response.data)[0] as Offer;
      });

      const offers = await Promise.all(offersPromises);

      // Zgrupuj allegroOffersIds z wszystkich ofert według kanałów sprzedaży
      const allegroOffersIds: Record<"AL1" | "AL2", string[]> = {
        AL1: [],
        AL2: [],
      };

      offers.forEach((offer) => {
        if (offer.allegroOffersIds) {
          Object.entries(offer.allegroOffersIds).forEach(
            ([salesChannel, sizeToIdMap]) => {
              const channel = salesChannel as "AL1" | "AL2";
              const offerIds = Object.values(sizeToIdMap);
              allegroOffersIds[channel].push(...offerIds);
            },
          );
        }
      });

      // Mapowanie aktualizacji dla obu kanałów - teraz dla każdej oferty osobno
      const allUpdates = Object.entries(allegroOffersIds).flatMap(
        ([salesChannel, offerIds]) =>
          offerIds.map(async (allegroOfferId) => {
            const channel = salesChannel as "AL1" | "AL2";

            // Pobierz aktualną ofertę Allegro dla tego konkretnego ID
            const allegroOfferResponse = await axios.get(
              `/api/allegro/offers/${allegroOfferId}?salesChannel=${channel}`,
            );

            const currentAllegroOffer =
              allegroOfferResponse.data as AllegroOffer;

            // Usuń publication z obecnej oferty (jeśli istnieje)
            const productWithoutPublication = {
              ...currentAllegroOffer.productSet[0].product,
            };
            if ("publication" in productWithoutPublication) {
              delete (productWithoutPublication as any).publication;
            }

            // Połącz obecne parametry z nowymi (nowe parametry nadpisują stare)
            const currentParameters =
              currentAllegroOffer.productSet[0].product.parameters;

            // Upewnij się, że formattedParameters to tablica
            const newParameters = Array.isArray(formattedParameters)
              ? formattedParameters
              : (Object.values(
                  formattedParameters,
                ) as AllegroOfferParameters[0][]);

            // Połącz parametry - jeśli parametr o tej samej nazwie istnieje, zastąp go nowym
            const mergedParametersMap = new Map<
              string,
              AllegroOfferParameters[0]
            >();

            // Dodaj obecne parametry
            currentParameters.forEach((param: AllegroOfferParameters[0]) => {
              mergedParametersMap.set(param.name, param);
            });

            // Nadpisz/dodaj nowe parametry
            newParameters.forEach((param: AllegroOfferParameters[0]) => {
              mergedParametersMap.set(param.name, param);
            });

            // Przekonwertuj z powrotem na tablicę
            const mergedParameters = Array.from(mergedParametersMap.values());

            // Utwórz updateData z połączonymi parametrami
            const updateData = {
              productSet: [
                {
                  ...currentAllegroOffer.productSet[0],
                  product: {
                    ...productWithoutPublication,
                    parameters: mergedParameters,
                  },
                },
              ],
            };

            return axios.patch(`/api/allegro/offers/${allegroOfferId}`, {
              offerPartial: updateData,
              salesChannel: channel,
            });
          }),
      );

      await Promise.all(allUpdates);
    } catch (error) {
      handleError(
        error,
        "Wystąpił błąd podczas aktualizacji parametrów na Allegro.",
      );
      return;
    } finally {
      stopLoading();
    }
  };

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

    if (isDone && allegroCategoryId) {
      await editAllegroOfferParams(data);
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

      if (isDone) {
        router.push("/admin-panel/products");
      } else {
        router.push("/admin-panel/create-products/parameters");
      }
    } catch (error) {
      showToast(
        `Wystąpił błąd podczas aktualizacji parametrów: ${error}`,
        "error",
      );
    } finally {
      stopLoading();
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
          disabled={isDone}
          name="samplePhoto"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Zdjęcie poglądowe</FormLabel>
              <FormControl>
                <ImageUploader
                  filePath={field.value || ""}
                  setFilePath={field.onChange}
                  folderPath={`products/sample-photos/${productType}`}
                  disabled={isDone}
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
        <ResponsibleProducerSelector disabled={isDone} />
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
        {productType === "obuwie" && !isDone ? (
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
        ) : productType === "akcesoria" ? (
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
                      Number.isInteger(Number(r.to)),
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
        ) : (
          <></>
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
              disabled={isDone}
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
              disabled={isDone}
            />
          )}
        />

        <FormField
          control={form.control}
          name="matchingCategoriesIds"
          render={({ field }) => (
            <MatchingCategoriesSelector
              value={field.value as string[]}
              onChange={field.onChange}
              rootCategory={rootCategory}
              mainCategoryId={categoryId}
            />
          )}
        />

        <FormField
          control={form.control}
          name="features"
          rules={{
            required: "Cechy produktu są wymagane.",
          }}
          render={({ field }) => (
            <MultipleSearchSelect
              label="Cechy produktu"
              value={field.value as string[]}
              onChange={field.onChange}
              options={availableProductFeatures.map((feature) => ({
                label: feature,
                value: feature,
              }))}
              placeholder="Wybierz cechy produktu"
            />
          )}
        />

        <FormField
          control={form.control}
          name="otherInfo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Inne informacje</FormLabel>
              <FormControl>
                <TextEditor
                  value={field.value as string}
                  onChange={field.onChange}
                  className="md:w-full"
                />
              </FormControl>
            </FormItem>
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
