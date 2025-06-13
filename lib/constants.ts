export const choosingSizeImageFilePath =
  "other/jak_dobrac_rozmiar (1).jpg" as const;

export type SalesChannel = "AL1" | "AL2" | "POS" | "DTC";

export const salesChannels: SalesChannel[] = [
  "AL1",
  "AL2",
  "POS",
  "DTC",
] as const;

export const allegroSalesChannels: SalesChannel[] = ["AL1", "AL2"] as const;

export const availableProductFeatures = [
  "lekkie",
  "wodoodporne",
  "oddychające",
  "antypoślizgowe",
  "elastyczne",
  "szerokie",
  "wąskie",
  "stabilne",
  "sztywny zapiętek",
  "zdrowotne",
  "z wkładką ortopedyczną",
  "polski producent",
  "miękkie wnętrze",
  "miękka wkładka",
  "ocieplane",
  "ciepłe",
  "na co dzień",
  "eleganckie",
] as const;
