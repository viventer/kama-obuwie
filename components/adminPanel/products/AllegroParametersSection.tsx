"use client";

import { AllegroProductParameter } from "@/server-actions/allegro/products";
import axios from "axios";
import { useEffect, useState } from "react";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import AllegroParametersSectionFormItem from "./AllegroParametersSectionFormItem";
import MiniLoader from "../global/MiniLoader";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

export const allegroParametersToSkip = [
  "Marka",
  "Rozmiar",
  "Kod producenta",
  "Długość wkładki",
  "Kolor",
  "Odcień",
  "Kolor dodatkowy",
];

export default function AllegroParametersSection({
  allegroCategoryId,
  value,
  onChange,
}: {
  allegroCategoryId: string | undefined;
  value: ProductParameters;
  onChange: (newParams: ProductParameters) => void;
}) {
  const [optionalParameters, setOptionalParameters] =
    useState<AllegroProductParameter[]>();
  const [requiredParameters, setRequiredParameters] =
    useState<AllegroProductParameter[]>();

  const requiredValues = value?.required || {};
  const optionalValues = value?.optional || {};

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

        setOptionalParameters(optional);
        setRequiredParameters(required);
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, [allegroCategoryId]);

  if (
    !requiredParameters ||
    requiredParameters.length === 0 ||
    !optionalParameters ||
    optionalParameters.length === 0 ||
    !allegroCategoryId
  ) {
    return <MiniLoader />;
  }

  return (
    <section className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        {requiredParameters.map((parameter) => (
          <AllegroParametersSectionFormItem
            key={parameter.name}
            parameter={parameter}
            onChange={onChange}
            optionalValues={optionalValues}
            requiredValues={requiredValues}
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
              <AllegroParametersSectionFormItem
                key={parameter.name}
                parameter={parameter}
                onChange={onChange}
                optionalValues={optionalValues}
                requiredValues={requiredValues}
              />
            ))}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
