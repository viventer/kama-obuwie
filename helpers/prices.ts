export const addPercentToPrice = (amount: string, percent: number): string => {
  const base = Number.parseFloat(amount);
  if (!Number.isFinite(base)) return amount;

  const value = base * (1 + percent / 100);
  // 2 miejsca po przecinku, bez artefaktów float
  return (Math.round((value + Number.EPSILON) * 100) / 100).toFixed(2);
};
