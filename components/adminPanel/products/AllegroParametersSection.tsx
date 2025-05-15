"use client";

import { AllegroProductParameter } from "@/server-actions/allegro/products";
import axios from "axios";
import { useEffect, useState } from "react";
import MultipleSelect from "../global/form/MultipleSelect";

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
  value: Record<string, string> | undefined;
  onChange: (...event: any[]) => void;
}) {
  const [optionalParameters, setOptionalParameters] =
    useState<AllegroProductParameter[]>();
  const [requiredParameters, setRequiredParameters] =
    useState<AllegroProductParameter[]>();

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
          (parameter: AllegroProductParameter) =>
            (parameter.required === false || parameter.name === "EAN (GTIN)") &&
            !allegroParametersToSkip.includes(parameter.name)
        );
        const required = listData.filter(
          (parameter: AllegroProductParameter) =>
            parameter.required === true &&
            parameter.name !== "EAN (GTIN)" &&
            !allegroParametersToSkip.includes(parameter.name)
        );

        console.log(optional);
        setOptionalParameters(optional);
        setRequiredParameters(required);
      } catch (error) {
        console.error("Error fetching parameters:", error);
      }
    };

    fetchParameters();
  }, [allegroCategoryId]);

  return (
    <section className={`${allegroCategoryId ? "block" : "hidden"}`}></section>
  );
}
