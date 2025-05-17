"use client";

import { AllegroProductParameter } from "@/server-actions/allegro/products";
import axios from "axios";
import { useEffect, useState } from "react";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import AllegroParametersSectionFormItem from "./AllegroParametersSectionFormItem";
import MiniLoader from "../global/MiniLoader";

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
    if (!allegroCategoryId) {
      return;
    }

    const fetchParameters = async () => {
      try {
        const { data } = await axios.get(
          `/api/allegro/parameters/${allegroCategoryId}`
        );
        const listData: AllegroProductParameter[] = Object.values(data);
        const optional = listData.filter(
          (parameter) =>
            (parameter.required === false || parameter.name === "EAN (GTIN)") &&
            !allegroParametersToSkip.includes(parameter.name)
        );
        const required = listData.filter(
          (parameter) =>
            parameter.required === true &&
            parameter.name !== "EAN (GTIN)" &&
            !allegroParametersToSkip.includes(parameter.name)
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
    <section className="flex flex-col gap-4">
      {requiredParameters?.map((parameter) => (
        <AllegroParametersSectionFormItem
          parameter={parameter}
          onChange={onChange}
          optionalValues={optionalValues}
          requiredValues={requiredValues}
          key={parameter.name}
        />
      ))}

      {optionalParameters?.map((parameter) => (
        <AllegroParametersSectionFormItem
          parameter={parameter}
          onChange={onChange}
          optionalValues={optionalValues}
          requiredValues={requiredValues}
          key={parameter.name}
        />
      ))}
    </section>
  );
}
