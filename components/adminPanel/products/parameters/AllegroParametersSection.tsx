"use client";

import { AllegroProductParameter } from "@/server-actions/allegro/products";
import axios from "axios";
import { useEffect, useState } from "react";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import AllegroParametersSectionFormItem from "./AllegroParametersSectionFormItem";
import MiniLoader from "../../global/MiniLoader";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { Controller, useFormContext } from "react-hook-form";

export const allegroParametersToSkip = [
  "Marka",
  "Rozmiar",
  "Kod producenta",
  "Długość wkładki",
  "Kolor",
  "Odcień",
  "Kolor dodatkowy",
  "Rozmiar zakresowy",
];

export default function AllegroParametersSection({
  allegroCategoryId,
}: {
  allegroCategoryId: string | undefined;
}) {
  const [optionalParameters, setOptionalParameters] =
    useState<AllegroProductParameter[]>();
  const [requiredParameters, setRequiredParameters] =
    useState<AllegroProductParameter[]>();

  const { control, watch } = useFormContext<ProductWithId>();
  const currentParams = watch("parameters") || { required: {}, optional: {} };

  useEffect(() => {
    if (!allegroCategoryId) return;

    const fetchParameters = async () => {
      try {
        const { data } = await axios.get(
          `/api/allegro/parameters/${allegroCategoryId}`
        );
        const listData: AllegroProductParameter[] = Object.values(data);
        const optional = listData.filter(
          (p) =>
            (p.required === false || p.name === "EAN (GTIN)") &&
            !allegroParametersToSkip.includes(p.name)
        );
        const required = listData.filter(
          (p) =>
            p.required === true &&
            p.name !== "EAN (GTIN)" &&
            !allegroParametersToSkip.includes(p.name)
        );

        console.log("Optional parameters:", optional);
        console.log("Required parameters:", required);
        setOptionalParameters(optional);
        setRequiredParameters(required);
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, [allegroCategoryId]);

  if (!allegroCategoryId) {
    return null;
  }

  if (!optionalParameters || optionalParameters.length === 0) {
    return <MiniLoader />;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {requiredParameters?.map((parameter) => (
          <Controller
            key={parameter.name}
            control={control}
            name={`parameters.required.${parameter.name}`}
            defaultValue={currentParams?.required?.[parameter.name] || ""}
            rules={{ required: true }}
            render={({ field }) => (
              <AllegroParametersSectionFormItem
                key={parameter.name}
                parameter={parameter}
                onChange={field.onChange}
                value={field.value}
              />
            )}
          />
        ))}
      </div>

      <Accordion
        type="single"
        collapsible
        defaultValue=""
        className="shadow-md bg-background/50 rounded-sm max-w-md px-4"
      >
        <AccordionItem value="optional">
          <AccordionTrigger className="font-semibold text-lg hover:cursor-pointer">
            Parametry opcjonalne
          </AccordionTrigger>
          <AccordionContent className="flex flex-col gap-4 pt-2">
            {optionalParameters.map((parameter) => (
              <Controller
                key={parameter.name}
                control={control}
                name={`parameters.optional.${parameter.name}`}
                defaultValue={currentParams?.required?.[parameter.name] || ""}
                render={({ field }) => (
                  <AllegroParametersSectionFormItem
                    key={parameter.name}
                    parameter={parameter}
                    onChange={field.onChange}
                    value={field.value}
                  />
                )}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
