import {
  ListingFilterAttributes,
  ProductParameters,
  ParamValueSchema,
} from "@/firebase/schemas/productsSchemas";
import { normalizeColorForFilter } from "@/helpers/listingFilters/normalizeColor";
import { z } from "zod";

type ParamValue = z.infer<typeof ParamValueSchema>;

const PARAMETER_ALIASES = {
  color: ["kolor"],
  externalMaterial: ["materiał zewnętrzny", "materiał"],
  fastening: ["zapięcie", "rodzaj zapięcia"],
} as const;

const JUNK_VALUE_SUBSTRINGS = ["bez", "inna", "inne"] as const;

const isJunkValue = (value: string): boolean => {
  const lower = value.toLowerCase();
  return JUNK_VALUE_SUBSTRINGS.some((s) => lower.includes(s));
};

const normalizeParamValue = (value: ParamValue): string[] => {
  if (Array.isArray(value)) {
    return value
      .map((v) => String(v).trim())
      .filter((v) => v.length > 0 && !isJunkValue(v));
  }
  if (typeof value === "boolean") {
    return [];
  }
  const str = String(value).trim();
  if (!str || isJunkValue(str)) return [];
  return [str];
};

const findParamValues = (
  parameters: ProductParameters | undefined,
  aliases: readonly string[],
): string[] => {
  if (!parameters) return [];

  const allEntries = [
    ...Object.entries(parameters.required || {}),
    ...Object.entries(parameters.optional || {}),
  ];

  const aliasSet = new Set(aliases.map((a) => a.toLowerCase()));

  for (const [key, value] of allEntries) {
    if (aliasSet.has(key.toLowerCase())) {
      return normalizeParamValue(value);
    }
  }

  return [];
};

/** Color from `parameters.optional.Kolor` (legacy products). */
export const getListingColorFromOptionalParameters = (
  parameters?: ProductParameters,
): string | undefined => {
  const optional = parameters?.optional;
  if (!optional) return undefined;

  const aliasSet = new Set<string>(PARAMETER_ALIASES.color);
  const entry = Object.entries(optional).find(([key]) =>
    aliasSet.has(key.toLowerCase()),
  );
  if (!entry) return undefined;

  return normalizeColorForFilter(normalizeParamValue(entry[1])[0]);
};

/** Extract listing filter attributes from product parameters + color variant. */
export const extractListingFilterAttributes = ({
  parameters,
  color,
}: {
  parameters?: ProductParameters;
  color?: string;
}): ListingFilterAttributes | undefined => {
  const externalMaterial = findParamValues(
    parameters,
    PARAMETER_ALIASES.externalMaterial,
  );
  const fastening = findParamValues(parameters, PARAMETER_ALIASES.fastening);
  const normalizedColor = normalizeColorForFilter(color);

  if (
    !normalizedColor &&
    externalMaterial.length === 0 &&
    fastening.length === 0
  ) {
    return undefined;
  }

  return {
    ...(normalizedColor ? { color: normalizedColor } : {}),
    ...(externalMaterial.length > 0 ? { externalMaterial } : {}),
    ...(fastening.length > 0 ? { fastening } : {}),
  };
};
