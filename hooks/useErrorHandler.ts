import { useToast } from "./useToast";
import { handleApiError } from "@/server-actions/errorHandlers";

/**
 * Hook do obsługi błędów API w komponentach React
 * Automatycznie wyświetla toast z odpowiednim komunikatem błędu
 */
export function useErrorHandler() {
  const { showToast } = useToast();

  /**
   * Obsługuje błąd API i wyświetla toast
   * @param error - obiekt błędu z axios
   * @param defaultMessage - domyślny komunikat błędu
   * @param onError - opcjonalna funkcja callback wykonywana po błędzie
   * @param duration - czas wyświetlania toast w milisekundach (opcjonalny)
   */
  const handleError = (
    error: any,
    defaultMessage: string,
    onError?: () => void,
    duration?: number
  ) => {
    console.error("Błąd API:", error);
    const errorMessage = handleApiError(error, defaultMessage);
    showToast(errorMessage, "error", duration);
    onError?.();
  };

  return { handleError };
}
