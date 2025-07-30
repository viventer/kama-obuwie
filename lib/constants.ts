export const choosingSizeImageFilePath =
  "other/jak_dobrac_rozmiar (1).jpg" as const;

export type SalesChannel = "AL1" | "AL2" | "POS" | "DTC";

export type AllegroSalesChannel = "AL1" | "AL2";

export const salesChannels: SalesChannel[] = [
  "AL1",
  "AL2",
  "POS",
  "DTC",
] as const;

export const allegroSalesChannels: AllegroSalesChannel[] = [
  "AL1",
  "AL2",
] as const;

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

export const availableUserRoles = ["UNVERIFIED", "VERIFIED", "ADMIN"];

export const safetyInformation =
  "Produkt przeznaczony jest do użytku zgodnie z jego przeznaczeniem – jako obuwie do chodzenia. Nie stosować w warunkach, do których nie jest przystosowany (np. kontakt z ogniem, ostrymi przedmiotami, substancjami chemicznymi). Użytkowanie w sposób niezgodny z przeznaczeniem może prowadzić do uszkodzeń obuwia lub urazów. Obuwie należy dobierać do rozmiaru stopy oraz rodzaju aktywności, dla której jest przeznaczone. Nie używać uszkodzonego lub nadmiernie zużytego obuwia. Przechowywać w suchym, przewiewnym miejscu, z dala od źródeł ciepła i ognia.";
