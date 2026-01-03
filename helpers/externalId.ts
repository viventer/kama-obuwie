/**
 * Extracts SKU and size from externalId and returns the signature
 * @param externalId - string containing signature and SKU with size in format "[SKU]r[size]" where size can be single (e.g., "32") or range (e.g., "34-35")
 * @returns object with signature, SKU, and size
 */
export const parseExternalId = (
  externalId: string
): {
  signature: string;
  SKU: string | null;
  size: string | null;
} => {
  if (!externalId || typeof externalId !== "string") {
    return {
      signature: externalId || "",
      SKU: null,
      size: null,
    };
  }

  // Pattern to match [SKU] or [SKU]r[size] anywhere in the string
  // SKU is 4 characters (base32), size can be numeric or range (e.g., 34-35)
  const pattern = /\[([A-Z2-9]{4})(?:r(\d+(?:-\d+)?))?\]/g;
  const matches = [...externalId.matchAll(pattern)];

  if (matches.length === 0) {
    return {
      signature: externalId,
      SKU: null,
      size: null,
    };
  }

  // Take the last match (most recent SKU)
  const lastMatch = matches[matches.length - 1];
  const sku = lastMatch[1] || null; // e.g., "AB1C" or "6GYS"
  const size = (lastMatch[2] || null) as string | null; // e.g., "32" or "34-35" or null

  // Remove ALL occurrences of [SKU] and [SKU]r[size] patterns
  const signature = externalId
    .replace(/\[([A-Z2-9]{4})(?:r(\d+(?:-\d+)?))?\]/g, "")
    .trim();

  return {
    signature,
    SKU: sku,
    size,
  };
};

/**
 * Buduje external.id w formacie:
 * - "{signature} [{SKU}r{size}]" dla ofert z rozmiarem
 * - "{signature} [{SKU}]" dla ofert bez rozmiaru (np. akcesoria)
 */
export const buildExternalId = (params: {
  signature: string;
  SKU: string;
  size?: string | null | undefined;
}): string => {
  const signature = (params.signature || "").trim();
  const SKU = (params.SKU || "").trim();
  const size = (params.size || "").toString().trim();

  const sizeSuffix = size ? `r${size}` : "";
  const bracket = `[${SKU}${sizeSuffix}]`;

  return `${signature} ${bracket}`.trim();
};

/**
 * Usuwa rozmiar i kanał sprzedaży z external.id
 * Formaty do usunięcia:
 * - r[rozmiar] np. "r32" lub "r34-35"
 * - [kanał]r[rozmiar] np. "AL1r32", "AL2r32" lub "AL1r34-35"
 *
 * @param externalId - Ciąg znaków z external.id (może być pusty)
 * @returns Oczyszczony ciąg znaków
 */
export const cleanOldExternalId = (
  externalId: string | null | undefined
): string => {
  if (!externalId || externalId.trim() === "") {
    return "";
  }

  let cleaned = externalId.trim();

  cleaned = cleaned.replace(/\s*(AL[12])r\d+(?:-\d+)?\s*$/, "");

  cleaned = cleaned.replace(/\s*r\d+(?:-\d+)?\s*$/, "");

  return cleaned.trim();
};
