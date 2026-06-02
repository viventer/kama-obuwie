"use client";

import { Form, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { AllegroOffer, OfferWithId } from "@/firebase/schemas/offersSchemas";
import { FormEvent, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { useToast } from "@/hooks/useToast";
import axios from "axios";

type FormValues = {
  DTC: string | undefined;
  AL1: string | undefined;
  AL2: string | undefined;
  POS: string | undefined;
  allegroIndividualPrices: OfferWithId["allegroIndividualPrices"];
};

export default function ChangePricesDialogContent({
  offerData,
}: {
  offerData: OfferWithId;
}) {
  const sizes = Object.keys(offerData.availability);

  const { closeDialog } = useDialogWindow();
  const { showToast } = useToast();

  const form = useForm({
    defaultValues: {
      DTC: offerData.sellingPrices.DTC,
      AL1: offerData.sellingPrices.AL1,
      AL2: offerData.sellingPrices.AL2,
      POS: offerData.sellingPrices.POS,
      allegroIndividualPrices: offerData.allegroIndividualPrices,
    },
  });

  useEffect(() => {
    sizes.forEach((size) => {
      const current = form.getValues(`allegroIndividualPrices.${size}.value`);
      console.log(current);
      if (current == null) {
        form.setValue(
          `allegroIndividualPrices.${size}.value`,
          offerData.sellingPrices.AL1!,
        );
      }
    });
  }, [offerData, sizes, form]);

  // Watch AL1 and update all individual size prices when AL1 really changes
  const watchedAL1 = form.watch("AL1");
  const prevAL1Ref = useRef<string | number | undefined>(form.getValues("AL1"));
  useEffect(() => {
    const prev = prevAL1Ref.current;
    const prevNum = prev === undefined || prev === "" ? NaN : Number(prev);
    const currentNum =
      watchedAL1 === undefined || watchedAL1 === "" ? NaN : Number(watchedAL1);

    const bothNaN = isNaN(prevNum) && isNaN(currentNum);
    if (bothNaN) return; // both empty/invalid — no change
    if (prevNum === currentNum) return; // numeric value didn't change

    sizes.forEach((size) => {
      form.setValue(`allegroIndividualPrices.${size}.value`, watchedAL1!);
    });

    prevAL1Ref.current = watchedAL1;
  }, [watchedAL1, sizes, form]);

  const updateOfferPriceInDB = async (formData: FormValues) => {
    try {
      await axios.patch(`/api/offers/${offerData.id}`, {
        sellingPrices: {
          DTC: formData.DTC,
          AL1: formData.AL1,
          AL2: formData.AL2,
          POS: formData.POS,
        },
        allegroIndividualPrices: { ...formData.allegroIndividualPrices },
      });
    } catch (err) {
      showToast("Błąd podczas aktualizacji cen w bazie danych.", "error");
      return;
    }
  };

  const updateOffersPriceOnAllegro = async (formData: FormValues) => {
    const updatePromises = sizes.map(async (size) => {
      const individualPrice = formData.allegroIndividualPrices?.[size]?.value;
      if (individualPrice == null || individualPrice === "") {
        showToast(`Cena dla rozmiaru ${size} jest wymagana.`, "error");
        return;
      }

      const sellingModeValue: AllegroOffer["sellingMode"] = {
        price: {
          amount: individualPrice,
          currency: "PLN" as const,
        },
      };

      const AL1OfferId = offerData.allegroOffersIds?.AL1?.[size];
      const AL2OfferId = offerData.allegroOffersIds?.AL2?.[size];

      try {
        if (AL1OfferId) {
          await axios.patch(`/api/allegro/offers/${AL1OfferId}`, {
            offerPartial: {
              sellingMode: sellingModeValue,
            },
            salesChannel: "AL1",
          });
        } else {
          showToast(
            `Brak oferty na AL1 dla rozmiaru ${size}. Nie można zaktualizować ceny.`,
            "error",
          );
        }

        if (AL2OfferId) {
          await axios.patch(`/api/allegro/offers/${AL2OfferId}`, {
            offerPartial: {
              sellingMode: sellingModeValue,
            },
            salesChannel: "AL2",
          });
        } else {
          showToast(
            `Brak oferty na AL2 dla rozmiaru ${size}. Nie można zaktualizować ceny.`,
            "error",
          );
        }
      } catch (err) {
        console.log(err);
        showToast(
          `Błąd podczas aktualizacji ceny dla rozmiaru ${size}.`,
          "error",
        );
      }
    });

    Promise.all(updatePromises);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const formData = form.getValues();

    await updateOfferPriceInDB(formData);
    await updateOffersPriceOnAllegro(formData);

    showToast("Ceny zostały zaktualizowane.", "success");
    closeDialog();
  };

  return (
    <div>
      <Form {...form}>
        <section className="flex gap-x-4 gap-y-3 flex-wrap mb-6">
          <FormField
            control={form.control}
            name="DTC"
            render={({ field }) => (
              <FormItem className="w-[90px]">
                <FormLabel className="text-sm opacity-85 font-normal">
                  DTC
                </FormLabel>
                <Input
                  type="number"
                  value={field.value || ""}
                  onChange={field.onChange}
                  min={0.01}
                  step={0.01}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="AL1"
            render={({ field }) => (
              <FormItem className="w-[90px]">
                <FormLabel className="text-sm opacity-85 font-normal">
                  AL1
                </FormLabel>
                <Input
                  type="number"
                  value={field.value || ""}
                  onChange={field.onChange}
                  min={0.01}
                  step={0.01}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="AL2"
            render={({ field }) => (
              <FormItem className="w-[90px]">
                <FormLabel className="text-sm opacity-85 font-normal">
                  AL2
                </FormLabel>
                <Input
                  type="number"
                  value={field.value || ""}
                  onChange={field.onChange}
                  min={0.01}
                  step={0.01}
                />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="POS"
            render={({ field }) => (
              <FormItem className="w-[90px]">
                <FormLabel className="text-sm opacity-85 font-normal">
                  POS
                </FormLabel>
                <Input
                  type="number"
                  value={field.value || ""}
                  onChange={field.onChange}
                  min={0.01}
                  step={0.01}
                />
              </FormItem>
            )}
          />
        </section>
        <section className="mb-6">
          <h3 className="font-medium mb-2">
            Ceny dla poszczególnych rozmiarów na AL1
          </h3>
          <div className="flex gap-x-4 gap-y-3 flex-wrap">
            {sizes.map((size) => (
              <FormField
                key={size}
                control={form.control}
                name={`allegroIndividualPrices.${size}.value`}
                render={({ field }) => (
                  <FormItem className="w-[90px]">
                    <FormLabel className="text-sm opacity-85 font-normal">
                      r. {size}
                    </FormLabel>
                    <Input
                      type="number"
                      value={field.value || ""}
                      onChange={field.onChange}
                      min={0.01}
                      step={0.01}
                    />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </section>
      </Form>
      <div className="flex mt-2 gap-4">
        <Button onClick={(e) => handleSubmit(e)} className="w-fit">
          Zapisz
        </Button>
        <Button
          onClick={(e) => closeDialog()}
          className="w-fit"
          variant="destructive"
        >
          Odrzuć
        </Button>
      </div>
    </div>
  );
}
