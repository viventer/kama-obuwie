export function toBase64UrlNoPadding(value: string): string {
  return Buffer.from(value, "utf8")
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

// Usuwa emoji z tekstu (bez ruszania HTML tagów).
// Uwaga: używa Unicode property escapes, wymagane środowisko z obsługą /u i \p{...} (Node 16+).
export function stripEmoji(value: string): string {
  return value
    .replace(/[\u200D\uFE0E\uFE0F]/g, "")
    .replace(/\u20E3/g, "")
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, "")
    .replace(/\p{Extended_Pictographic}/gu, "");
}
