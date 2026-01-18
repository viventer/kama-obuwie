import type { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import type { AllegroOfferDescription } from "@/firebase/schemas/offersSchemas";
import type {
  Description,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";

export type ParsedProductDescription = {
  advantages: string[];
  salesDescription?: string;
};

const normalizeForSearch = (value: string): string => {
  return value
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[łŁ]/g, "l")
    .replace(/[ąĄ]/g, "a")
    .replace(/[ćĆ]/g, "c")
    .replace(/[ęĘ]/g, "e")
    .replace(/[ńŃ]/g, "n")
    .replace(/[óÓ]/g, "o")
    .replace(/[śŚ]/g, "s")
    .replace(/[żŻ]/g, "z")
    .replace(/[źŹ]/g, "z");
};

const stripHtml = (html: string): string => {
  return html
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
};

const extractHtmlFromDescription = (
  description:
    | ProductWithId["description"]
    | LegacyProductWithId["allegroDescription"],
): string => {
  if (!description) return "";

  // Nowy format: Description (tablica wierszy)
  if (Array.isArray(description)) {
    const rows = description as Description;
    const parts: string[] = [];
    for (const row of rows) {
      for (const el of row.elements || []) {
        if (typeof el?.content === "string" && el.content.trim()) {
          parts.push(el.content);
        }
      }
    }
    return parts.join("\n");
  }

  // Legacy: AllegroOfferDescription { sections: [...] }
  const maybeAllegro = description as AllegroOfferDescription;
  if (maybeAllegro && Array.isArray(maybeAllegro.sections)) {
    const parts: string[] = [];
    for (const section of maybeAllegro.sections) {
      for (const item of section.items || []) {
        if (item?.type === "TEXT" && typeof item.content === "string") {
          parts.push(item.content);
        }
      }
    }
    return parts.join("\n");
  }

  return "";
};

const extractParagraphs = (html: string): string[] => {
  const matches = html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi);
  if (!matches) return [];
  return matches.map((p) => p.trim()).filter(Boolean);
};

const extractH2Blocks = (
  html: string,
): Array<{ html: string; index: number }> => {
  const regex = /<h2\b[^>]*>[\s\S]*?<\/h2>/gi;
  const out: Array<{ html: string; index: number }> = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(html)) !== null) {
    out.push({ html: match[0], index: match.index });
  }
  return out;
};

const containsCheckmark = (value: string): boolean => value.includes("✅");

const isNonEmptyParagraph = (pHtml: string): boolean => {
  const text = stripHtml(pHtml);
  return text.length > 0;
};

const unwrapOuterPTags = (pHtml: string): string => {
  const match = pHtml.match(/^<p\b[^>]*>([\s\S]*?)<\/p>$/i);
  return (match?.[1] ?? pHtml).trim();
};

/**
 * Parsuje opis produktu (nowy Description lub legacy AllegroOfferDescription) na:
 * - advantages: każdy paragraf (<p>) zawierający ✅ (z zachowaniem HTML)
 * - salesDescription: pierwsza sekcja zaczynająca się od <h2>, której nagłówek nie zawiera "rozmiar",
 *   i która ma co najmniej jeden paragraf bez ✅. Zwracany jest fragment od tego <h2> do następnego <h2> (bez niego).
 */
export const parseProductDescription = (
  description:
    | ProductWithId["description"]
    | LegacyProductWithId["allegroDescription"],
): ParsedProductDescription => {
  const html = extractHtmlFromDescription(description);
  if (!html.trim()) {
    return { advantages: [] };
  }

  const paragraphs = extractParagraphs(html);
  // Uwaga: `extractParagraphs` zwraca pełne <p>...</p>. Jeśli później
  // owiniesz to kolejnym <p>, powstaje nieprawidłowe <p><p>...</p></p>,
  // co przeglądarka "naprawia" inaczej niż React i powoduje hydration mismatch.
  const advantages = paragraphs
    .filter((p) => containsCheckmark(p))
    .map(unwrapOuterPTags)
    .filter(Boolean);

  // Szukamy pierwszej sekcji: <h2> ... </h2> + dalsza treść,
  // gdzie h2 nie zawiera "rozmiar" i w sekcji jest przynajmniej jeden <p> bez ✅.
  let salesDescription: string | undefined;
  const h2s = extractH2Blocks(html);

  const blockedSalesDescriptionH2Substrings = [
    "rozmiar",
    "dane",
    "cechy",
    "zalety",
    "parametry",
    "specyfikacja",
  ];

  for (let i = 0; i < h2s.length; i++) {
    const start = h2s[i]!.index;
    const end = i + 1 < h2s.length ? h2s[i + 1]!.index : html.length;

    const h2Text = normalizeForSearch(stripHtml(h2s[i]!.html));
    if (
      blockedSalesDescriptionH2Substrings.some((blocked) =>
        h2Text.includes(blocked),
      ) ||
      !h2Text
    ) {
      continue;
    }

    const block = html.slice(start, end).trim();
    if (!block) continue;

    const blockParagraphs =
      extractParagraphs(block).filter(isNonEmptyParagraph);
    const hasNonCheckmarkParagraph = blockParagraphs.some(
      (p) => !containsCheckmark(p),
    );
    if (!hasNonCheckmarkParagraph) {
      continue;
    }

    salesDescription = block;
    break;
  }

  return {
    advantages,
    ...(salesDescription ? { salesDescription } : {}),
  };
};
