import { clsx, type ClassValue } from "clsx";

import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function truncateString(str: string, maxLength: number): string {
  return str.length > maxLength ? str.slice(0, maxLength) + "..." : str;
}

export function formatDate(dateString?: string): string | null {
  if (!dateString) return null;

  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("pl-PL", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "nieprawidłowa data";
  }
}

export function getFormattedSizingTable(
  insoleLengths: { size: string; insoleLength: number }[]
): string {
  const header = `
<h2>Jak dobrać rozmiar?</h2>
<p><b>1.</b>&nbsp;Stojąc na kartce papieru odrysuj kontur stopy.</p>
<p><b>2.</b>&nbsp;Zmierz w centymetrach odległość pomiędzy najdalszymi punktami (A).</p>
<p><b>3.</b>&nbsp;Dodaj do wyniku 0,5 cm i porównaj z długościami podanymi poniżej:</p>
`.trim();

  const listItems = insoleLengths
    .map(
      ({ size, insoleLength }) =>
        `<ul><li><b>r. ${size}</b> - ${insoleLength} cm</li></ul>`
    )
    .join("");

  return header + listItems;
}
