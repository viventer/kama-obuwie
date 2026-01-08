export type PriceRange = {
  from: number;
  to: number;
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
  prices: number[]
): PriceRange[] | null => {
  const median = getMedian(prices);
  const minValue = Math.min(...prices);
  const maxValue = Math.max(...prices);

  if (minValue === maxValue || maxValue - minValue < 10) {
    return null;
  }

  let minRangePrice = roundToPsychologicalPrice(0.85 * median);
  if (minRangePrice <= minValue) {
    minRangePrice = minValue;
  }

  let maxRangePrice = roundToPsychologicalPrice(1.15 * median);
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
