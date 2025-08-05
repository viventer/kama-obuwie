// Funkcja do wyciągania rozmiaru z tytułu oferty
export function extractSizeFromTitle(title: string): string | null {
  // Sprawdź czy kończy się formatem dd-dd (np. "35-36")
  const sizeRangeMatch = title.match(/(\d{2}-\d{2})$/);
  if (sizeRangeMatch) {
    return sizeRangeMatch[1];
  }

  // Sprawdź czy kończy się formatem dd (np. "35")
  const singleSizeMatch = title.match(/(\d{2})$/);
  if (singleSizeMatch) {
    return singleSizeMatch[1];
  }

  return null;
}
