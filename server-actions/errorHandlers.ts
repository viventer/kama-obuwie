import { DocumentReference } from "firebase-admin/firestore";
import { NextResponse } from "next/server";
import { AllegroAuthError } from "@/firebase/schemas/shipmentsSchemas";

export interface ApiErrorResponse {
  message: string;
  status: number;
  errors?: any[];
  details?: Record<string, any>;
}

export function apiResponse(
  message: string,
  status: number,
  data?: Record<string, any>
): Response {
  if (status === 204) {
    return new NextResponse(null, { status });
  }

  if (status >= 200 && status < 400) {
    return NextResponse.json({ ...data }, { status });
  }
  return NextResponse.json({ message }, { status });
}

export function apiErrorResponse(
  message: string,
  status: number,
  errors?: any,
  details?: Record<string, any>
): Response {
  const errorResponse: any = {
    message,
    status,
  };

  if (errors) {
    errorResponse.errors = errors;
  }

  if (details) {
    errorResponse.details = details;
  }

  return NextResponse.json(errorResponse, { status });
}

export function formatAllegroError(
  baseMessage: string,
  allegroErrors: any[],
  step?: string
): string {
  const allegroMessages = allegroErrors
    .map((error: any) => {
      let errorText = error.userMessage || error.message || "Nieznany błąd";

      if (error.path) {
        errorText += ` (pole: ${error.path})`;
      }

      if (
        error.code &&
        !["VALIDATION_ERROR", "INVALID_INPUT"].includes(error.code)
      ) {
        errorText += ` [${error.code}]`;
      }

      return errorText;
    })
    .filter(Boolean)
    .join("; ");

  let errorMessage = allegroMessages
    ? `${baseMessage}: ${allegroMessages}`
    : baseMessage;

  if (step) {
    const stepTranslations: Record<string, string> = {
      shipment_creation: "podczas tworzenia przesyłki",
      shipment_status_check: "podczas sprawdzania statusu przesyłki",
      shipment_creation_failed: "przesyłka nie została utworzona",
      shipment_details: "podczas pobierania szczegółów przesyłki",
      label_download: "podczas pobierania etykiety",
      file_storage: "podczas zapisywania etykiety",
      offer_creation: "podczas tworzenia oferty",
    };

    const stepDesc = stepTranslations[step] || step;
    errorMessage += ` (błąd ${stepDesc})`;
  }

  return errorMessage;
}

/**
 * Uniwersalna funkcja do obsługi błędów API w komponentach React
 * Automatycznie formatuje błędy z Allegro API i zwraca odpowiedni komunikat
 *
 * @param error - obiekt błędu z axios
 * @param defaultMessage - domyślny komunikat błędu
 * @returns sformatowany komunikat błędu
 */
export function handleApiError(error: any, defaultMessage: string): string {
  if (error.response?.data) {
    const errorData = error.response.data;

    // Sprawdź czy to błąd z naszego API z dodatkowymi informacjami
    if (errorData.errors && Array.isArray(errorData.errors)) {
      return formatAllegroError(
        defaultMessage,
        errorData.errors,
        errorData.details?.step
      );
    } else if (errorData.message) {
      // Standardowy błąd z message
      return errorData.message;
    }
  } else if (error.message) {
    return error.message;
  }

  return defaultMessage;
}

/**
 * Uniwersalna funkcja do obsługi błędów Axios w server actions
 * Automatycznie przekształca błędy z Allegro API na format z allegroErrors i status
 *
 * @param error - obiekt błędu z axios (AxiosError)
 * @param defaultMessage - domyślny komunikat błędu
 * @throws Error z properties allegroErrors i status dla błędów Allegro
 */
export function handleAxiosError(error: any, defaultMessage: string): never {
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Body:", JSON.stringify(error.response.data, null, 2));

    // Sprawdź czy to błąd 401 z inną strukturą
    if (error.response.status === 401 && "error" in error.response.data) {
      const authError = error.response.data as AllegroAuthError;
      const allegroError = new Error(
        `Błąd autoryzacji: ${authError.error_description || authError.error}`
      );
      (allegroError as any).allegroErrors = [
        {
          code: authError.error,
          message: authError.error_description || authError.error,
          userMessage: "Błąd autoryzacji. Sprawdź połączenie z Allegro.",
          details: "",
          path: null,
        },
      ];
      (allegroError as any).status = error.response.status;
      throw allegroError;
    }

    // Standardowe błędy z tablicą errors
    if ("errors" in error.response.data) {
      const allegroError = new Error(`Błąd Allegro: ${error.response.status}`);
      (allegroError as any).allegroErrors = error.response.data.errors;
      (allegroError as any).status = error.response.status;
      throw allegroError;
    }

    // Nieznana struktura błędu
    const allegroError = new Error(`Błąd Allegro: ${error.response.status}`);
    (allegroError as any).allegroErrors = [
      {
        code: "UNKNOWN_ERROR",
        message: "Nieznany błąd API",
        userMessage: "Wystąpił nieoczekiwany błąd w API Allegro",
        details: JSON.stringify(error.response.data),
        path: null,
      },
    ];
    (allegroError as any).status = error.response.status;
    throw allegroError;
  } else if (error.request) {
    throw new Error("Brak odpowiedzi z serwera Allegro");
  } else {
    throw new Error(`Nieoczekiwany błąd: ${error.message}`);
  }
}

export type DocumentDataWithRef<T> = {
  data: T | null;
  ref: DocumentReference;
};
