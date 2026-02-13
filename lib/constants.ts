import { HomeGridCategory } from "@/components/store/home/HomeGrid";
import { RootCategory } from "@/firebase/schemas/productsSchemas";
import { CreateShipmentData } from "@/firebase/schemas/shipmentsSchemas";

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

export const senderAddress: CreateShipmentData["sender"] = {
  company: "Anna Kamińska KAM-A",
  street: "Hala Targowa Gazaris boks nr 39",
  city: "Bochnia",
  postalCode: "32-700",
  countryCode: "PL",
  email: "kontakt.obuwie.kama@gmail.com",
  phone: "664097737",
};

export const bankAccountData = {
  owner: "ANNA KAMIŃSKA - KAM-A",
  iban: "PL66 1140 2004 0000 3302 8572 0482",
};

export const reasonTranslations: Record<string, string> = {
  NONE: "Nie podano",
  MISTAKE: "Pomyłka",
  TRANSPORT: "Uszkodzenie w transporcie",
  DAMAGED: "Uszkodzone",
  NOT_AS_DESCRIBED: "Niezgodne z opisem",
  DONT_LIKE_IT: "Nie pasuje mi",
  OVERDUE_DELIVERY: "Opóźniona dostawa",
  INCOMPLETE: "Niekompletne",
  HIDDEN_FLAW: "Ukryta wada",
  OTHER_FLAW: "Inna wada",
  DIFFERENT: "Inne niż zamówione",
  COUNTERFEIT: "Podróbka",
};

export const returnStatusTranslations: Record<string, string> = {
  CREATED: "Utworzony",
  DISPATCHED: "Wysłany",
  IN_TRANSIT: "W transporcie",
  DELIVERED: "Doręczony",
  FINISHED: "Zakończony",
  FINISHED_APT: "Zakończony APT",
  REJECTED: "Odrzucony",
  COMMISSION_REFUND_CLAIMED: "Żądanie zwrotu prowizji",
  COMMISSION_REFUNDED: "Prowizja zwrócona",
  WAREHOUSE_DELIVERED: "Dostarczony do magazynu",
  WAREHOUSE_VERIFICATION: "Weryfikacja magazynowa",
};

export const orderStatusTranslations: Record<string, string> = {
  UNPAID: "nieopłacone",
  NEW: "opłacone",
  PROCESSING: "w realizacji",
  READY_FOR_SHIPMENT: "gotowe do wysyłki",
  READY_FOR_PICKUP: "gotowe do odbioru",
  SENT: "wysłane",
  PICKED_UP: "odebrane",
  CANCELLED: "anulowane",
  SUSPENDED: "wstrzymane",
  RETURNED: "zwrócone",
};

export type CategoryFromMainPage = {
  name: string;
  rootCategory: RootCategory;
  id?: string;
  displayName: string;
};

export const categoriesFromMainPage: CategoryFromMainPage[] = [
  {
    name: "botki",
    rootCategory: "obuwie damskie",
    displayName: "Botki Damskie",
  },
  {
    name: "trzewiki",
    rootCategory: "obuwie męskie",
    displayName: "Trzewiki Męskie",
  },
  {
    name: "kozaki",
    rootCategory: "obuwie damskie",
    displayName: "Kozaki Damskie",
  },
  {
    name: "kapcie",
    rootCategory: "obuwie damskie",
    displayName: "Kapcie Damskie",
  },
  {
    name: "kapcie",
    rootCategory: "obuwie męskie",
    displayName: "Kapcie Męskie",
  },
  {
    name: "kapcie",
    rootCategory: "obuwie dziecięce",
    displayName: "Kapcie Dziecięce",
  },
  {
    name: "baleriny",
    rootCategory: "obuwie dziecięce",
    displayName: "Baleriny Dziewczęce",
  },
  {
    name: "trampki",
    rootCategory: "obuwie dziecięce",
    displayName: "Trampki Dziecięce",
  },
  {
    name: "sportowe",
    rootCategory: "obuwie dziecięce",
    displayName: "Sportowe Dziecięce",
  },
  {
    name: "klapki basenowe (sportowe)",
    rootCategory: "obuwie damskie",
    displayName: "Klapki Basenowe Damskie",
  },
  {
    name: "klapki",
    rootCategory: "obuwie męskie",
    displayName: "Klapki Męskie",
  },
] as const;

export const homeGridCategories: Omit<HomeGridCategory, "id">[] = [
  {
    name: "półbuty",
    rootCategory: "obuwie męskie",
    displayName: "Półbuty Męskie",
    imageSrc: "/main-grid/polbuty-meskie.jpg",
  },
  {
    name: "czółenka",
    rootCategory: "obuwie damskie",
    displayName: "Czółenka Damskie",
    imageSrc: "/main-grid/czolenka-damskie.jpg",
  },
  {
    name: "baleriny",
    rootCategory: "obuwie damskie",
    displayName: "Baleriny Damskie",
    imageSrc: "/main-grid/baleriny-damskie.jpg",
  },
];

export type HomeSliderBanner = {
  imageSrc: string;
  heading: string;
  subheading: string;
};

export const homeSliderBanners: HomeSliderBanner[] = [
  {
    imageSrc: "/home-slider/1.jpg",
    heading: "Czółenka",
    subheading: "Eleganckie i wygodne czółenka na każdą okazję",
  },
  {
    imageSrc: "/home-slider/2.jpg",
    heading: "Półbuty",
    subheading: "Klasyczne półbuty męskie - styl i komfort w jednym",
  },
  {
    imageSrc: "/home-slider/3.jpg",
    heading: "Kapcie Damskie",
    subheading: "Wygodne kapcie od polskiego producenta - idealne na co dzień",
  },
  {
    imageSrc: "/home-slider/4.jpg",
    heading: "Kapcie Męskie",
    subheading: "Wygodne kapcie od polskiego producenta - idealne na co dzień",
  },
];
