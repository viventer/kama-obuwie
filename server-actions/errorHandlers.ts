import { AllegroAuthError } from "@/firebase/schemas/shipmentsSchemas";

export function formatAllegroError(
  baseMessage: string,
  allegroErrors: any[],
  step?: string,
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
        errorData.details?.step,
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
export function handleAllegroApiError(
  error: any,
  defaultMessage: string,
): never {
  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Body:", JSON.stringify(error.response.data, null, 2));

    // Sprawdź czy to błąd 401 z inną strukturą
    if (error.response.status === 401 && "error" in error.response.data) {
      const authError = error.response.data as AllegroAuthError;
      const allegroError = new Error(
        `Błąd autoryzacji: ${authError.error_description || authError.error}`,
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

/**
 * Uniwersalna funkcja do obsługi błędów Axios w server actions dla InPost API
 * Automatycznie przekształca błędy z InPost API na format z inpostErrors i status
 *
 * @param error - obiekt błędu z axios (AxiosError)
 * @param defaultMessage - domyślny komunikat błędu
 * @throws Error z properties inpostErrors i status dla błędów InPost
 */
export function handleInpostApiError(
  error: any,
  defaultMessage: string,
): never {
  if (error.response) {
    console.error("InPost Status:", error.response.status);
    console.error("InPost Status:", error.response.data);
    console.error("InPost Body:", JSON.stringify(error.response.data, null, 2));

    // Sprawdź czy to struktura błędu InPost (error, description, details)
    if ("error" in error.response.data) {
      const inpostErrorData = error.response.data;

      const errorTranslations: Record<string, string> = {
        resource_not_found: "Zasób nie został znaleziony",
        access_forbidden: "Brak dostępu",
        invalid_parameter: "Nieprawidłowy parametr",
        validation_failed: "Walidacja nie powiodła się",
        offer_expired: "Oferta wygasła",
        no_carriers: "Nie masz podpisanej umowy z przewoźnikiem",
        carrier_unavailable:
          "Nie masz podpisanej umowy z przewoźnikiem świadczącym wybraną usługę wskazaną w atrybucie service",
        label_generation_failed: "Błąd generowania etykiety",
        label_template_not_found: "Nie znaleziono szablonu etykiety",
        invalid_action: "Przesyłka nie została opłacona",
      };

      const userMessage =
        errorTranslations[inpostErrorData.error] || inpostErrorData.error;
      let fullMessage = userMessage;

      if (inpostErrorData.description) {
        fullMessage += `: ${inpostErrorData.description}`;
      }

      // Dodaj szczegóły walidacji jeśli istnieją
      if (inpostErrorData.details) {
        const detailsMessages = Object.entries(inpostErrorData.details)
          .map(
            ([field, errors]) => `${field}: ${(errors as string[]).join(", ")}`,
          )
          .join("; ");

        if (detailsMessages) {
          fullMessage += ` (${detailsMessages})`;
        }
      }

      const inpostError = new Error(`Błąd InPost: ${fullMessage}`);
      (inpostError as any).inpostErrors = [
        {
          code: inpostErrorData.error,
          message: inpostErrorData.description || userMessage,
          userMessage: fullMessage,
          details: inpostErrorData.details || null,
        },
      ];
      (inpostError as any).status = error.response.status;
      throw inpostError;
    }

    // Nieznana struktura błędu
    const inpostError = new Error(`Błąd InPost: ${error.response.status}`);
    (inpostError as any).inpostErrors = [
      {
        code: "UNKNOWN_ERROR",
        message: defaultMessage,
        userMessage: "Wystąpił nieoczekiwany błąd w API InPost",
        details: JSON.stringify(error.response.data),
      },
    ];
    (inpostError as any).status = error.response.status;
    throw inpostError;
  } else if (error.request) {
    throw new Error("Brak odpowiedzi z serwera InPost");
  } else {
    throw new Error(`Nieoczekiwany błąd: ${error.message}`);
  }
}

/**
 * Uniwersalna funkcja do obsługi błędów Axios w server actions dla Przelewy24 API
 * Automatycznie przekształca błędy z P24 API na format z p24Errors i status
 *
 * @param error - obiekt błędu z axios (AxiosError)
 * @param defaultMessage - domyślny komunikat błędu
 * @throws Error z properties p24Errors i status dla błędów Przelewy24
 */
export function handleP24ApiError(error: any, defaultMessage: string): never {
  if (error.response) {
    console.error("P24 Status:", error.response.status);
    console.error("P24 Body:", JSON.stringify(error.response.data, null, 2));

    // Sprawdź czy to struktura błędu P24 (error, code)
    if ("error" in error.response.data) {
      const p24ErrorData = error.response.data;

      const errorTranslations: Record<string, string> = {
        "Invalid input data": "Nieprawidłowe dane wejściowe",
        "Incorrect authentication": "Błąd autoryzacji",
      };

      const userMessage =
        errorTranslations[p24ErrorData.error] || p24ErrorData.error;

      const p24Error = new Error(`Błąd Przelewy24: ${userMessage}`);
      (p24Error as any).p24Errors = [
        {
          code: p24ErrorData.code,
          message: p24ErrorData.error,
          userMessage: userMessage,
        },
      ];
      (p24Error as any).status = error.response.status;
      throw p24Error;
    }

    // Nieznana struktura błędu
    const p24Error = new Error(`Błąd Przelewy24: ${error.response.status}`);
    (p24Error as any).p24Errors = [
      {
        code: error.response.status,
        message: defaultMessage,
        userMessage: "Wystąpił nieoczekiwany błąd w API Przelewy24",
      },
    ];
    (p24Error as any).status = error.response.status;
    throw p24Error;
  } else if (error.request) {
    throw new Error("Brak odpowiedzi z serwera Przelewy24");
  } else {
    throw new Error(`Nieoczekiwany błąd: ${error.message}`);
  }
}
