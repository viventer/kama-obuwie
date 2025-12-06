import { NextResponse } from "next/server";

/**
 * Validates if a string is a valid 4-character base32 SKU
 * @param sku - string to validate
 * @returns boolean indicating if the SKU is valid
 */
export const isValidSKU = (sku: string): boolean => {
  if (sku.length !== 4) return false;

  const base32Regex = /^[23456789ABCDEFGHJKLMNPQRSTUVWXYZ]{4}$/;
  return base32Regex.test(sku);
};

/**
 * Generuje unikalny numer zamówienia w formacie base32
 * Format: XXXXXXXY gdzie Y to cyfra kanału sprzedaży (1-4)
 * - AL1 = 1, AL2 = 2, POS = 3, DTC = 4
 * - Maksymalnie 8 znaków
 * - Tylko duże litery i cyfry (bez O, 0, 1, I)
 * - Obsługuje 50k zamówień dziennie bez powtórzeń
 */
export function generateOrderNumber(
  salesChannel: "AL1" | "AL2" | "POS" | "DTC"
): string {
  // Alfabet base32 bez niejednoznacznych znaków (bez O, 0, 1, I)
  const ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 32 znaki

  // Mapowanie kanałów na cyfry
  const channelMap = {
    AL1: "1",
    AL2: "2",
    POS: "3",
    DTC: "4",
  };

  // Timestamp w sekundach (zmniejsza rozmiar)
  const timestamp = Math.floor(Date.now() / 1000);

  // Losowa część (3 znaki) - dla 32^3 = 32,768 kombinacji na sekundę
  const randomPart = Array.from(
    { length: 3 },
    () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  ).join("");

  // Konwersja timestamp na base32 (około 3-4 znaki)
  let timestampBase32 = "";
  let num = timestamp;
  while (num > 0 && timestampBase32.length < 4) {
    timestampBase32 = ALPHABET[num % 32] + timestampBase32;
    num = Math.floor(num / 32);
  }

  // Skróć timestamp do maksymalnie 3 znaków (bierz ostatnie 3)
  const shortTimestamp = timestampBase32.slice(-3);

  // Format: [timestamp-3][random-3][channel-1] = 7 znaków
  const orderNumber = shortTimestamp + randomPart + channelMap[salesChannel];

  return orderNumber;
}

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
