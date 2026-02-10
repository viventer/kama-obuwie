import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { UseFormReturn } from "react-hook-form";

export const validateOfferForm = async (
  form: UseFormReturn,
  mode: "edit" | "create",
): Promise<{ message: string; isValid: boolean }> => {
  // Sprawdź walidację pól formularza
  const isValid = await form.trigger();

  if (!isValid) {
    const errors = form.formState.errors;
    console.log("Błędy walidacji:", errors);

    // Znajdź pierwszy błąd i zwróć jego komunikat
    const firstError = Object.values(errors).find((error) => error?.message);
    const message = firstError?.message || "Formularz zawiera błędy";

    return { message: String(message), isValid: false };
  }

  // Dodatkowa walidacja dostępności
  if (mode === "create") {
    const availabilityCheck = validateAvailability(
      form.getValues("availability") as OfferWithId["availability"],
    );
    if (availabilityCheck && !availabilityCheck.isValid) {
      return availabilityCheck;
    }
  }

  // Walidacja cen sprzedaży
  const sellingPrices = form.getValues(
    "sellingPrices",
  ) as OfferWithId["sellingPrices"];

  if (!sellingPrices || Object.keys(sellingPrices).length === 0) {
    return {
      message: "Brak cen sprzedaży",
      isValid: false,
    };
  }

  for (const [channel, price] of Object.entries(sellingPrices)) {
    if (!price || price === "") {
      return {
        message: `Brak ceny sprzedaży dla kanału ${channel}`,
        isValid: false,
      };
    }
  }

  // Walidacja stawek wysyłki
  const shippingRates = form.getValues(
    "shippingRates",
  ) as OfferWithId["shippingRates"];

  if (!shippingRates || Object.keys(shippingRates).length === 0) {
    return {
      message: "Brak stawek wysyłki",
      isValid: false,
    };
  }

  for (const [channel, rates] of Object.entries(shippingRates)) {
    if (!rates?.allegroId) {
      return {
        message: `Brak stawek wysyłki dla kanału ${channel}`,
        isValid: false,
      };
    }
  }

  // Walidacja polityki zwrotów
  const returnPolicy = form.getValues(
    "returnPolicy",
  ) as OfferWithId["returnPolicy"];

  if (!returnPolicy || Object.keys(returnPolicy).length === 0) {
    return {
      message: "Brak polityki zwrotów",
      isValid: false,
    };
  }

  for (const [channel, policy] of Object.entries(returnPolicy)) {
    if (!policy || policy === "") {
      return {
        message: `Brak polityki zwrotów dla kanału ${channel}`,
        isValid: false,
      };
    }
  }

  // Walidacja warunków reklamacji
  const impliedWarranty = form.getValues(
    "impliedWarranty",
  ) as OfferWithId["impliedWarranty"];

  if (!impliedWarranty || Object.keys(impliedWarranty).length === 0) {
    return {
      message: "Brak warunków reklamacji",
      isValid: false,
    };
  }

  for (const [channel, warranty] of Object.entries(impliedWarranty)) {
    if (!warranty || warranty === "") {
      return {
        message: `Brak warunków reklamacji dla kanału ${channel}`,
        isValid: false,
      };
    }
  }

  return { message: "Formularz jest poprawny", isValid: true };
};

export const isValidUrl = (value: any): value is string => {
  if (typeof value !== "string") return false;
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
};

export const validateAvailability = (
  availability: OfferWithId["availability"],
  mode: "edit" | "create" = "create",
) => {
  if (!availability || Object.keys(availability).length === 0) {
    return {
      message: "Brak dostępności produktu",
      isValid: false,
    };
  }

  for (const [size, sizeAvailability] of Object.entries(availability)) {
    if (
      !sizeAvailability?.value ||
      sizeAvailability.value === "" ||
      (sizeAvailability.value === "0" && mode === "create")
    ) {
      return {
        message: `Minimalna dostępność dla rozmiaru ${size} wynosi 1.`,
        isValid: false,
      };
    }
  }
};
