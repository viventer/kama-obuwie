import { ProductListingData } from "@/firebase/schemas/productsSchemas";

/**
 * Zwraca klucz dostępności dla ofert bez rozmiaru.
 *
 * W praktyce dla akcesoriów w `offer.availability` jest zwykle jeden wpis (np. "0").
 * Gdy wpisów jest więcej, preferujemy "0" jeśli istnieje.
 */
export const resolveSingleAvailabilityKey = (
  availability: Record<string, unknown> | null | undefined
): string => {
  const safeAvailability =
    availability && typeof availability === "object" ? availability : {};

  const keys = Object.keys(safeAvailability);
  if (keys.length === 1) return keys[0];

  if (Object.prototype.hasOwnProperty.call(safeAvailability, "0")) return "0";

  return keys[0] || "0";
};

export const orderByProductAvailability = (
  productA: ProductListingData,
  productB: ProductListingData
): number => {
  const aUnavailable = Object.values(productA.availability).filter(
    (value) => value == 0
  ).length;
  const bUnavailable = Object.values(productB.availability).filter(
    (value) => value == 0
  ).length;

  return aUnavailable - bUnavailable;
};
