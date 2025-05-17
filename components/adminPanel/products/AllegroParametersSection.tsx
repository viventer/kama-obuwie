"use client";

import { AllegroProductParameter } from "@/server-actions/allegro/products";
import axios from "axios";
import { useEffect, useState } from "react";
import MultipleSelect from "../global/form/MultipleSelect";
import SingleSelect from "../global/form/SingleSelect";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";
import InputFormItem from "../global/form/InputFormItem";

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

  // Rozbicie wartości na required i optional
  const requiredValues = value?.required || {};
  const optionalValues = value?.optional || {};

  // Aktualizacja parametru po nazwie
  const handleParamChange = (
    nameKey: string,
    val: string | string[],
    isOptional: boolean
  ) => {
    const newRequired = { ...requiredValues };
    const newOptional = { ...optionalValues };

    if (isOptional) {
      newOptional[nameKey] = val;
    } else {
      newRequired[nameKey] = val as string;
    }

    onChange({ required: newRequired, optional: newOptional });
  };

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

  return (
    <section
      className={`${
        allegroCategoryId ? "block" : "hidden"
      } flex flex-col gap-4`}
    >
      {requiredParameters?.map((parameter) => {
        const nameKey = parameter.name;
        const current = (requiredValues[nameKey] as string) || "";

        if (
          parameter.type === "dictionary" &&
          parameter.restrictions?.multipleChoices
        ) {
          // traktujemy jako optional, bo multipick
          return (
            <MultipleSelect
              key={nameKey}
              label={parameter.name}
              value={(optionalValues[nameKey] as string[]) || []}
              onChange={(vals) => handleParamChange(nameKey, vals, true)}
              availableOptions={
                parameter.dictionary?.map((el) => el.value) || []
              }
            />
          );
        }

        if (parameter.type === "dictionary") {
          return (
            <SingleSelect
              key={nameKey}
              label={parameter.name}
              value={current}
              onChange={(val) => handleParamChange(nameKey, val, false)}
              availableOptions={
                parameter.dictionary?.map((el) => el.value) || []
              }
            />
          );
        }

        if (parameter.type === "string" || parameter.type === "float") {
          return (
            <InputFormItem
              key={nameKey}
              label={parameter.name}
              type={parameter.type === "string" ? "text" : "number"}
              value={current}
              onChange={(e) =>
                handleParamChange(nameKey, e.target.value, false)
              }
            />
          );
        }

        return (
          <InputFormItem
            label={parameter.name}
            key={nameKey}
            type="text"
            value={current}
            onChange={(e) => handleParamChange(nameKey, e.target.value, false)}
          />
        );
      })}

      {/* Optional parameters */}
      {optionalParameters?.map((parameter) => {
        const nameKey = parameter.name;
        const current = optionalValues[nameKey] as
          | string
          | string[]
          | undefined;

        if (
          parameter.type === "dictionary" &&
          parameter.restrictions?.multipleChoices
        ) {
          // traktujemy jako optional, bo multipick
          return (
            <MultipleSelect
              key={nameKey}
              label={parameter.name}
              value={(optionalValues[nameKey] as string[]) || []}
              onChange={(vals) => handleParamChange(nameKey, vals, true)}
              availableOptions={
                parameter.dictionary?.map((el) => el.value) || []
              }
            />
          );
        }

        if (parameter.type === "dictionary") {
          return (
            <SingleSelect
              key={nameKey}
              label={parameter.name}
              value={current as string}
              onChange={(val) => handleParamChange(nameKey, val, false)}
              availableOptions={
                parameter.dictionary?.map((el) => el.value) || []
              }
            />
          );
        }

        if (parameter.type === "string" || parameter.type === "float") {
          return (
            <InputFormItem
              key={nameKey}
              label={parameter.name}
              type={parameter.type === "string" ? "text" : "number"}
              value={current as string | number}
              onChange={(e) =>
                handleParamChange(nameKey, e.target.value, false)
              }
            />
          );
        }

        return (
          <InputFormItem
            label={parameter.name}
            key={nameKey}
            type="text"
            value={current as string | number}
            onChange={(e) => handleParamChange(nameKey, e.target.value, false)}
          />
        );
      })}
    </section>
  );
}
