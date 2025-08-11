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

// Funkcja do usuwania rozmiaru z tytułu oferty
export function removeSizeFromTitle(title: string): string {
  // Usuń format r. dd-dd (np. "r. 33-34") z końca tytułu
  let cleanTitle = title.replace(/\s*r\.\s*(\d{2}-\d{2})$/i, "");

  // Jeśli nie znaleziono formatu r. dd-dd, usuń format r. dd (np. "r. 33") z końca
  if (cleanTitle === title) {
    cleanTitle = title.replace(/\s*r\.\s*(\d{2})$/i, "");
  }

  // Jeśli nie znaleziono formatów z r., usuń format dd-dd (np. "35-36") z końca tytułu
  if (cleanTitle === title) {
    cleanTitle = title.replace(/\s*(\d{2}-\d{2})$/, "");
  }

  // Jeśli nie znaleziono formatu dd-dd, usuń format dd (np. "35") z końca
  if (cleanTitle === title) {
    cleanTitle = title.replace(/\s*(\d{2})$/, "");
  }

  return cleanTitle.trim();
}
