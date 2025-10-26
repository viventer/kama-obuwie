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
import { FormEvent, useEffect, useState } from "react";
import {
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { useFullPageLoading } from "../../global/FullPageLoader";
import { validateOfferForm } from "../helpers/validation";
import { useToast } from "@/hooks/useToast";
import { AllegroOffer } from "@/firebase/schemas/offersSchemas";
import { allegroSalesChannels } from "@/lib/constants";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { useRouter } from "next/navigation";

function convertOfferPartialToAllegroOfferPartial(
  offerFragment: Partial<OfferWithId>,
  salesChannel: "AL1" | "AL2"
): Partial<AllegroOffer> {
  const allegroOffer: Partial<AllegroOffer> = {};

  if (offerFragment.sellingPrices?.[salesChannel]) {
    allegroOffer.sellingMode = {
      price: {
        amount: offerFragment.sellingPrices[salesChannel],
        currency: "PLN",
      },
    };
  } else {
    throw new Error(`Brak ceny sprzedaży dla kanału ${salesChannel}`);
  }

  if (offerFragment.shippingRates?.[salesChannel]?.allegroId) {
    allegroOffer.delivery = {
      shippingRates: {
        id: offerFragment.shippingRates[salesChannel].allegroId,
      },
    };
  } else {
    throw new Error(`Brak stawek wysyłki dla kanału ${salesChannel}`);
  }

  const afterSalesServices: AllegroOffer["afterSalesServices"] = {
    impliedWarranty: { id: "" },
    returnPolicy: { id: "" },
  };

  if (offerFragment.returnPolicy?.[salesChannel]) {
    afterSalesServices.returnPolicy = {
      id: offerFragment.returnPolicy[salesChannel],
    };
  } else {
    throw new Error(`Brak polityki zwrotów dla kanału ${salesChannel}`);
  }

  if (offerFragment.impliedWarranty?.[salesChannel]) {
    afterSalesServices.impliedWarranty = {
      id: offerFragment.impliedWarranty[salesChannel],
    };
  } else {
    throw new Error(`Brak warunków reklamacji dla kanału ${salesChannel}`);
  }

  if (offerFragment.warranty?.[salesChannel]) {
    afterSalesServices.warranty = {
      id: offerFragment.warranty[salesChannel],
    };
  }

  allegroOffer.afterSalesServices = afterSalesServices;

  return allegroOffer;
}

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
      availability: oldData.availability || {},
      returnPolicy: oldData.returnPolicy || {},
      warranty: oldData.warranty || {},
      impliedWarranty: oldData.impliedWarranty || {},
    },
    mode: "onChange",
  });

  const sizes = Object.keys(oldData.availability);
  useEffect(() => {
    sizes.forEach((size) => {
      const current = form.getValues(`availability.${size}.value`);
      if (current == null) {
        form.setValue(`availability.${size}.value`, "1");
      }
    });
  }, []);

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
        "error"
      );
      stopLoading();
      return;
    }

    const offersPartials = { AL1: {}, AL2: {} };

    try {
      offersPartials.AL1 = convertOfferPartialToAllegroOfferPartial(
        formData,
        "AL1"
      );

      offersPartials.AL2 = convertOfferPartialToAllegroOfferPartial(
        formData,
        "AL2"
      );
    } catch (err) {
      showToast(
        "Wystąpił błąd podczas konwersji oferty na format Allegro.",
        "error"
      );
      stopLoading();
      return;
    }

    try {
      const updatePromises = allegroSalesChannels.flatMap((salesChannel) => {
        const offersIds = oldData.allegroOffersIds?.[salesChannel] as Record<
          string,
          string
        >;
        return Object.entries(offersIds).map(async ([size, offerId]) => {
          const availability = Number(
            form.getValues(`availability.${size}.value`)
          );

          return axios.patch(`/api/allegro/offers/${offerId}`, {
            offerPartial: {
              ...offersPartials[salesChannel],
              stock: {
                available: availability || 0,
                unit: "PAIR",
              },
              name: `${form.getValues("title")} ${size}`,
              publication: {
                status: availability > 0 ? "ACTIVE" : "INACTIVE",
              },
            },
            salesChannel,
          });
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
        <AvailabilityField sizes={sizes} mode={"edit"} />
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
