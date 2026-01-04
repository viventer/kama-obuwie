import { createHash } from "crypto";

export type ParsedSignature = {
  brand?: string;
  manufacturerCode?: string;
  colorVariantName?: string;
};

export function normalizeSignature(signature: string): string {
  return (signature || "").replace(/\s+/g, " ").trim();
}

// Zakładany format: "{brand...} {manufacturerCode} {colorVariantName}"
export function parseSignature(signature: string): ParsedSignature {
  const normalized = normalizeSignature(signature);
  if (!normalized) return {};

  const parts = normalized.split(" ").filter(Boolean);
  if (parts.length < 2) return {};

  const colorVariantName = parts.at(-1);
  const manufacturerCode = parts.at(-2);
  const brand = parts.length > 2 ? parts.slice(0, -2).join(" ") : undefined;

  return {
    brand: brand || undefined,
    manufacturerCode: manufacturerCode || undefined,
    colorVariantName: colorVariantName || undefined,
  };
}

export function legacyProductIdFromSignature(signature: string): string | null {
  const normalized = normalizeSignature(signature);
  if (!normalized) {
    return null;
  }
  const hash = createHash("sha256")
    .update(normalized)
    .digest("hex")
    .slice(0, 24);
  return `sig_${hash}`;
}
