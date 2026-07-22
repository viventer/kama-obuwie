import {
  Offer,
  PriceHistory,
  PriceHistoryEntry,
} from "@/firebase/schemas/offersSchemas";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export type PriceRange = {
  from: number;
  to: number;
};

export type PriceHistoryChannel = "DTC" | "AL1";

export type DiscountInfo = {
  oldPrice: number;
  newPrice: number;
  percent: number;
};

const PRICE_HISTORY_CHANNELS: PriceHistoryChannel[] = ["DTC", "AL1"];
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;
const PRICE_HISTORY_RETENTION_MS = 35 * 24 * 60 * 60 * 1000;
const DISCOUNT_THRESHOLD = 0.95;

export const formatPLN = (value: number): string =>
  new Intl.NumberFormat("pl-PL", {
    style: "currency",
    currency: "PLN",
    minimumFractionDigits: 2,
  }).format(value);

export const getDiscountInfo = (
  current: number,
  reference: number | null,
): DiscountInfo | null => {
  if (
    reference == null ||
    !Number.isFinite(current) ||
    !Number.isFinite(reference) ||
    reference <= 0 ||
    current > reference * DISCOUNT_THRESHOLD
  ) {
    return null;
  }

  return {
    oldPrice: reference,
    newPrice: current,
    percent: Math.round(((reference - current) / reference) * 100),
  };
};

export const getLowestPrice30dReference = (
  offer: Pick<Offer, "sellingPrices" | "initialSellingPrices" | "priceHistory">,
  channel: PriceHistoryChannel = "DTC",
): number | null => {
  const history = offer.priceHistory?.[channel] ?? [];
  const now = Date.now();
  const windowStart = now - THIRTY_DAYS_MS;

  // Exclude the current (latest) price — reference is the lowest
  // price from the 30 days BEFORE the current price.
  const previousEntries = history.slice(0, -1);
  const inWindow: PriceHistoryEntry[] = [];
  let latestOlder: PriceHistoryEntry | null = null;

  for (const entry of previousEntries) {
    const entryTime = Date.parse(entry.date);
    if (!Number.isFinite(entryTime)) continue;

    if (entryTime >= windowStart) {
      inWindow.push(entry);
      continue;
    }

    if (!latestOlder || entryTime > Date.parse(latestOlder.date)) {
      latestOlder = entry;
    }
  }

  const candidates = latestOlder ? [latestOlder, ...inWindow] : inWindow;

  if (candidates.length > 0) {
    const prices = candidates
      .map((entry) => Number.parseFloat(entry.price))
      .filter((price) => Number.isFinite(price) && price > 0);
    if (prices.length > 0) {
      return Math.min(...prices);
    }
  }

  const fallback = offer.initialSellingPrices?.[channel];
  if (!fallback) return null;
  const fallbackPrice = Number.parseFloat(fallback);
  return Number.isFinite(fallbackPrice) && fallbackPrice > 0
    ? fallbackPrice
    : null;
};

const prunePriceHistoryEntries = (
  entries: PriceHistoryEntry[],
  nowIso: string = new Date().toISOString(),
): PriceHistoryEntry[] => {
  const now = Date.parse(nowIso);
  if (!Number.isFinite(now)) return entries;

  const retentionStart = now - PRICE_HISTORY_RETENTION_MS;
  const inWindow: PriceHistoryEntry[] = [];
  let latestOlder: PriceHistoryEntry | null = null;

  for (const entry of entries) {
    const entryTime = Date.parse(entry.date);
    if (!Number.isFinite(entryTime)) continue;

    if (entryTime >= retentionStart) {
      inWindow.push(entry);
      continue;
    }

    if (
      !latestOlder ||
      entryTime > Date.parse(latestOlder.date)
    ) {
      latestOlder = entry;
    }
  }

  return latestOlder ? [latestOlder, ...inWindow] : inWindow;
};

export const buildInitialPriceHistory = (
  sellingPrices: Offer["sellingPrices"],
  nowIso: string = new Date().toISOString(),
): PriceHistory => {
  const history: PriceHistory = {};

  for (const channel of PRICE_HISTORY_CHANNELS) {
    const price = sellingPrices?.[channel];
    if (!price) continue;
    history[channel] = [{ price, date: nowIso }];
  }

  return history;
};

export const appendPriceHistoryForChangedChannels = (
  currentOffer: Pick<Offer, "sellingPrices" | "priceHistory">,
  nextSellingPrices: Offer["sellingPrices"] | undefined,
  nowIso: string = new Date().toISOString(),
): PriceHistory | undefined => {
  if (!nextSellingPrices) return undefined;

  let changed = false;
  const nextHistory: PriceHistory = {
    ...(currentOffer.priceHistory || {}),
  };

  for (const channel of PRICE_HISTORY_CHANNELS) {
    const nextPrice = nextSellingPrices[channel];
    if (nextPrice == null) continue;
    if (nextPrice === currentOffer.sellingPrices?.[channel]) continue;

    changed = true;
    const existing = nextHistory[channel] ?? [];
    nextHistory[channel] = prunePriceHistoryEntries(
      [...existing, { price: nextPrice, date: nowIso }],
      nowIso,
    );
  }

  return changed ? nextHistory : undefined;
};

export const addPercentToPrice = (amount: string, percent: number): string => {
  const base = Number.parseFloat(amount);
  if (!Number.isFinite(base)) return amount;

  const value = base * (1 + percent / 100);
  // 2 miejsca po przecinku, bez artefaktów float
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
};

export function getMedian(numbers: number[]): number {
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

export function roundToPsychologicalPrice(price: number): number {
  const roundedToFive = Math.round(price / 5) * 5;
  return roundedToFive - 0.01;
}

export const getPriceRangesForFiltering = (
  prices: number[],
): PriceRange[] | null => {
  const median = getMedian(prices);
  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);

  if (minValue === maxValue || maxValue - minValue < 10) {
    return null;
  }

  let minRangePrice = roundToPsychologicalPrice(0.9 * median);
  if (minRangePrice <= minValue) {
    minRangePrice = minValue;
  }

  let maxRangePrice = roundToPsychologicalPrice(1.1 * median);
  if (maxRangePrice >= maxValue) {
    maxRangePrice = maxValue;
  }

  const priceRanges: PriceRange[] = [
    { from: 0, to: minRangePrice },
    {
      from: minRangePrice + 0.01,
      to: maxRangePrice,
    },
    { from: maxRangePrice + 0.01, to: Infinity },
  ];
  return priceRanges;
};

export const isProductPriceInRange = (
  product: ProductListingData,
  selectedRange: PriceRange[],
): boolean => {
  const price = Number(product.price);
  return selectedRange.some(
    (range) => price >= range.from && price <= range.to,
  );
};

export const getOfferPriceForDTC = (
  sellingPrices: Offer["sellingPrices"],
): string | null => {
  const { DTC, AL1 } = sellingPrices;
  return DTC || AL1 || null;
};

export function moneyValueToMicros(value: string): string {
  const [wholePart, fractionalPart = "0"] = value.split(".");
  const normalizedFraction = (fractionalPart + "00").slice(0, 2);
  const whole = Number.parseInt(wholePart || "0", 10);
  const fraction = Number.parseInt(normalizedFraction || "0", 10);
  if (!Number.isFinite(whole) || !Number.isFinite(fraction)) {
    throw new Error(`Nieprawidłowa kwota: ${value}`);
  }
  return String(whole * 1_000_000 + fraction * 10_000);
}
