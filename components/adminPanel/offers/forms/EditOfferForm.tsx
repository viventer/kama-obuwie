"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { useForm } from "react-hook-form";
import SellingPricesField from "./SellingPricesField";
import ShippingRatesSelector from "./ShippingRatesSelector";
import ReturnPolicySelector from "./ReturnPolicySelector";
import ImpliedWarrantySelector from "./ImpliedWarrantySelector";
import WarrantySelector from "./WarrantySelector";
import AvailabilityField from "./AvailabilityField";
import { FormEvent, useEffect } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useFullPageLoading } from "../../global/FullPageLoader";
import { validateOfferForm } from "../helpers/validation";
import { useToast } from "@/hooks/useToast";
import { allegroSalesChannels } from "@/lib/constants";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRouter } from "next/navigation";
import { convertOfferPartialToAllegroOfferPartial } from "../helpers/offers";

export default function EditOfferForm({ oldData }: { oldData: OfferWithId }) {
  const { startLoading, stopLoading } = useFullPageLoading();
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const router = useRouter();

  const form = useForm<Partial<OfferWithId>>({
    defaultValues: {
      title: oldData.title || "",
      sellingPrices: oldData.sellingPrices || {},
      shippingRates: oldData.shippingRates || {},
      returnPolicy: oldData.returnPolicy || {},
      warranty: oldData.warranty || {},
      impliedWarranty: oldData.impliedWarranty || {},
    },
    mode: "onChange",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    startLoading();
    const formData = form.getValues();
    const validationResult = await validateOfferForm(form, "edit");
    if (!validationResult.isValid) {
      showToast(validationResult.message, "error");
      stopLoading();
      return;
    }

    try {
      await axios.patch(`/api/offers/${oldData.id}`, formData);
    } catch (err) {
      showToast(
        "Wystąpił błąd podczas aktualizacji oferty w bazie danych.",
        "error",
      );
      stopLoading();
      return;
    }

    try {
      if (
        oldData?.isAddedToMerchantCenter &&
        oldData.SKU &&
        process.env.NEXT_PUBLIC_NODE_ENV === "production"
      ) {
        await axios.patch(`/api/merchant-center/offer/${oldData.id}`);
      }
    } catch (err) {
      showToast(
        "Wystąpił błąd podczas aktualizacji oferty w Google Merchant Center.",
        "error",
      );
      stopLoading();
      return;
    }

    const offersPartials = { AL1: {}, AL2: {} };

    try {
      offersPartials.AL1 = convertOfferPartialToAllegroOfferPartial(
        formData,
        "AL1",
      );

      offersPartials.AL2 = convertOfferPartialToAllegroOfferPartial(
        formData,
        "AL2",
      );
    } catch (err) {
      showToast(
        "Wystąpił błąd podczas konwersji oferty na format Allegro.",
        "error",
      );
      stopLoading();
      return;
    }

    try {
      const sizesToProcess = Object.keys(oldData.availability);

      const updatePromises = allegroSalesChannels.flatMap((salesChannel) => {
        const offersIds =
          (oldData.allegroOffersIds?.[salesChannel] as Record<
            string,
            string
          >) || {};

        return sizesToProcess.map(async (size) => {
          const offerPartial = {
            ...offersPartials[salesChannel],
            name: `${form.getValues("title")} ${size != "null" && size ? size : ""}`.trim(),
          };

          const existingOfferId = offersIds[size];

          // Dla AL2 nie tworzymy ofert – tylko edytujemy, jeśli istnieją.
          if (salesChannel === "AL2" && !existingOfferId) {
            return;
          }

          const createOffer = async (): Promise<string> => {
            const { data } = await axios.post(
              "/api/allegro/offers/individual",
              {
                offerId: oldData.id,
                size,
                salesChannel,
              },
            );
            return data.allegroOfferId as string;
          };

          let offerIdToUpdate = existingOfferId || (await createOffer());

          try {
            await axios.patch(`/api/allegro/offers/${offerIdToUpdate}`, {
              offerPartial,
              salesChannel,
            });
          } catch (err: any) {
            const status = err?.response?.status;
            if (status === 404) {
              if (salesChannel === "AL2") {
                return;
              }
              offerIdToUpdate = await createOffer();
              await axios.patch(`/api/allegro/offers/${offerIdToUpdate}`, {
                offerPartial,
                salesChannel,
              });
              return;
            }

            throw err;
          }
        });
      });

      await Promise.all(updatePromises);

      showToast("Oferty zostały zaaktualizowane.", "success");
      router.push("/admin-panel/offers");
    } catch (err) {
      handleError(err, "Błąd podczas aktualizacji oferty na Allegro");
    } finally {
      stopLoading();
    }
  };

  const handleReject = (e: FormEvent) => {};

  return (
    <Form {...form}>
      <div className="flex flex-col gap-6">
        <FormItem>
          <FormLabel className="font-medium">Tytuł oferty</FormLabel>
          <FormField
            control={form.control}
            name="title"
            rules={{
              required: "Tytuł oferty jest wymagany",
              minLength: {
                value: 12,
                message: "Tytuł musi mieć minimum 12 znaków",
              },
              maxLength: {
                value: 72,
                message: "Tytuł może mieć maksymalnie 72 znaki",
              },
            }}
            render={({ field }) => (
              <>
                <Input
                  type="text"
                  value={field.value || ""}
                  onChange={field.onChange}
                  minLength={12}
                  maxLength={72}
                />
              </>
            )}
          />
        </FormItem>
        <SellingPricesField />
        <ShippingRatesSelector />
        <ReturnPolicySelector />
        <ImpliedWarrantySelector />
        <WarrantySelector />
      </div>
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
  );
}
