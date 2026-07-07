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
  email: "biuro@kama-obuwie.pl",
  phone: "664097737",
};

export const bankAccountData = {
  owner: "ANNA KAMIŃSKA - KAM-A",
  iban: "PL66 1140 2004 0000 3302 8572 0482",
};

export const companyData = {
  name: 'Anna Kamińska - "KAM-A"',
  street: "ul. Krzęczków 42a",
  postalCode: "32-700",
  city: "Bochnia",
  nip: "8681255945",
  regon: "851796282",
  email: "kontakt@kama-obuwie.pl",
  phone: "+48 664 097 737",
  phoneHref: "tel:+48664097737",
} as const;

export const returnsAddress = {
  name: 'Anna Kamińska - "KAM-A"',
  line1: "pl. Gazaris 10 (Hala Targowa)",
  line2: "box 39",
  postalCode: "32-700",
  city: "Bochnia",
} as const;

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

export type BestsellersSectionCategory = {
  name: string;
  rootCategory: RootCategory;
  id?: string;
};

export const bestsellersSectionCategories: BestsellersSectionCategory[] = [
  {
    name: "czółenka",
    rootCategory: "obuwie damskie",
  },
  {
    name: "klapki basenowe",
    rootCategory: "obuwie damskie",
  },
  {
    name: "kapcie",
    rootCategory: "obuwie damskie",
  },
  {
    name: "baleriny",
    rootCategory: "obuwie damskie",
  },
  {
    name: "trampki",
    rootCategory: "obuwie dziecięce",
  },
  {
    name: "sportowe",
    rootCategory: "obuwie dziecięce",
  },
  {
    name: "baleriny",
    rootCategory: "obuwie dziecięce",
  },
  {
    name: "klapki",
    rootCategory: "obuwie dziecięce",
  },
  {
    name: "półbuty",
    rootCategory: "obuwie męskie",
  },
  {
    name: "klapki",
    rootCategory: "obuwie męskie",
  },
  {
    name: "kapcie",
    rootCategory: "obuwie męskie",
  },
  {
    name: "halówki",
    rootCategory: "obuwie męskie",
  },
] as const;

export type HomeSliderBanner = {
  imageSrc: string;
  heading: string;
  subheading: string;
  destination: {
    rootCategory: RootCategory;
    categoryName: string;
    categoryId?: string;
  };
};

export const homeSliderBanners: HomeSliderBanner[] = [
  {
    imageSrc: "/home-slider/1.jpg",
    heading: "Sandały damskie",
    subheading: "Stylowe, wygodne i przewiewne, idealne na lato",
    destination: {
      rootCategory: "obuwie damskie",
      categoryName: "sandały",
    },
  },
  {
    imageSrc: "/home-slider/2.jpg",
    heading: "Mokasyny męskie",
    subheading: "Doskonałe eleganckie buty na letnią porę",
    destination: {
      rootCategory: "obuwie męskie",
      categoryName: "Mokasyny",
    },
  },
  {
    imageSrc: "/home-slider/3.jpg",
    heading: "Klapki dziecięce",
    subheading: "Uniwersalne klapki do domu, na basen i do ogródka",
    destination: {
      rootCategory: "obuwie dziecięce",
      categoryName: "klapki",
    },
  },
];
