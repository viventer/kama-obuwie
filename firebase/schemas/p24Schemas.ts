import { z } from "zod";

const SignParamsForRegistrationSchema = z.object({
  sessionId: z.string(),
  merchantId: z.number().int(),
  amount: z.number().int(),
  currency: z.string(),
  crc: z.string(),
});

const SignParamsForVerificationSchema = z.object({
  sessionId: z.string(),
  orderId: z.number().int(),
  amount: z.number().int(),
  currency: z.string(),
  crc: z.string(),
});

export { SignParamsForRegistrationSchema, SignParamsForVerificationSchema };

const CartParametersSchema = z.object({
  sellerId: z.string().describe("ID Sklepu po stronie Partnera"),
  sellerCategory: z.string().describe("Kategoria sklepu"),
  name: z
    .string()
    .optional()
    .describe("Nazwa produktu. Wymagane dla metody płatności PayPal"),
  description: z
    .string()
    .optional()
    .describe("Opis produktu. Wymagane dla metody płatności PayPal"),
  quantity: z
    .number()
    .int()
    .optional()
    .describe("Ilość produktu. Wymagane dla metody płatności PayPal"),
  price: z
    .number()
    .int()
    .optional()
    .describe("Cena produktu. Wymagane dla metody płatności PayPal"),
  number: z
    .string()
    .optional()
    .describe("Numer produktu. Wymagane dla metody płatności PayPal"),
});

const ShippingSchema = z.object({
  type: z
    .enum(["0", "1", "2", "3"])
    .or(z.number().int().min(0).max(3))
    .describe(
      "Typ dostawy: 0 - kurier, 1 - dostawa do punktu, 2 - paczkomat, 3 - paczka w sklepie"
    ),
  address: z.string().describe("Adres dostawy: ulica i numer"),
  zip: z.string().describe("Kod pocztowy"),
  city: z.string().describe("Miasto adresu dostawy"),
  country: z.string().describe("Kraj adresu dostawy"),
});

// PSU (Payment Service User) schema
const PSUSchema = z.object({
  IP: z.string().optional().describe("IPv4 lub IPv6"),
  userAgent: z
    .string()
    .max(255)
    .optional()
    .describe(
      "userAgent to ciąg identyfikujący przeglądarkę i system operacyjny"
    ),
});

const AdditionalSchema = z.object({
  shipping: ShippingSchema.optional(),
});

export const RegisterTransactionDataSchema = z.object({
  merchantId: z.number().int().describe("ID Sklepu"),
  posId: z.number().int().describe("ID Sklepu (domyślnie ID Sprzedawcy)"),
  sessionId: z
    .string()
    .max(100)
    .describe("Unikalny identyfikator z systemu sprzedawcy"),
  amount: z
    .number()
    .int()
    .describe("Kwota transakcji wyrażona w groszach, np. 1.23 PLN = 123"),
  currency: z.string().max(3).describe("Wartość zgodna z ISO np. PLN"),
  description: z.string().max(1024).describe("Opis transakcji"),
  email: z.string().max(50).describe("Email Klienta"),
  client: z.string().max(40).optional().describe("Imię i nazwisko Klienta"),
  address: z.string().max(80).optional().describe("Adres Klienta"),
  zip: z.string().max(10).optional().describe("Kod pocztowy Klienta"),
  city: z.string().max(50).optional().describe("Miasto Klienta"),
  country: z
    .string()
    .max(2)
    .default("PL")
    .describe("Kody krajów zgodnie ISO, np. PL, DE itp"),
  phone: z
    .string()
    .max(12)
    .optional()
    .describe("Telefon klienta w formacie 481321132123"),
  language: z
    .string()
    .max(2)
    .default("pl")
    .describe(
      "Jeden z następujących kodów krajów zgodnie z normą ISO 639-1: bg, cs, de, en, es, fr, hr, hu, it, nl, pl, pt, se, sk, ro"
    ),
  method: z
    .number()
    .int()
    .optional()
    .describe("Identyfikator metody płatności"),
  urlReturn: z
    .string()
    .max(250)
    .describe("Adres powrotny po zakończeniu transakcji"),
  urlStatus: z
    .string()
    .max(250)
    .optional()
    .describe("Adres do przekazania statusu transakcji"),
  timeLimit: z
    .number()
    .int()
    .optional()
    .describe(
      "Limit czasu na wykonanie transakcji, 0 - brak limitu, maks. 99 (w minutach)"
    ),
  channel: z
    .number()
    .int()
    .optional()
    .describe(
      "1 - karty + ApplePay + GooglePay, 2 - przelewy, 4 - przelew tradycyjny, 8 - N/A, 16 - wszystkie 24/7, 32 - użyj przedpłatę, 64 – tylko metody pay-by-link, 128 – formy ratalne, 256 – wallety, 4096 - karty, 8192 - blik, 16384 - wszystkie metody z wyłączeniem blika"
    ),
  waitForResult: z
    .boolean()
    .optional()
    .describe(
      "Parametr determinuje, czy użytkownik zostanie przekierowany z powrotem do sklepu od razu po wykonaniu płatności"
    ),
  regulationAccept: z
    .boolean()
    .default(false)
    .describe("Akceptacja regulaminu Przelewy24"),
  shipping: z.number().int().optional().describe("Koszt dostawy/wysyłki"),
  transferLabel: z
    .string()
    .max(20)
    .optional()
    .describe(
      "Opis pojawiający się w tytule przelewu. Dozwolone znaki to [a-z A-Z 0-9 ęółśążźćńĘÓŁŚĄŻŹĆŃ . /\\ :- ]"
    ),
  mobileLib: z
    .literal(1)
    .optional()
    .describe(
      "Przesłanie tego parametru jest niezbędne przy wykorzystaniu bibliotek SDK"
    ),
  sdkVersion: z
    .string()
    .max(10)
    .optional()
    .describe(
      "Wersja bibliotek mobilnych. Określa czy transakcja jest mobilna"
    ),
  sign: z
    .string()
    .max(100)
    .describe(
      'Suma kontrolna parametrów: {"sessionId":"str","merchantId":int,"amount":int,"currency":"str","crc":"str"} liczona z użyciem sha384'
    ),
  encoding: z
    .string()
    .max(15)
    .optional()
    .describe(
      "System kodowania przesyłanych znaków: ISO-8859-2, UTF-8, Windows-1250"
    ),
  methodRefId: z
    .string()
    .max(250)
    .optional()
    .describe(
      "Specjalny parametr wymagany dla niektórych procesów płatności, np. BLIK i Karty one-click"
    ),
  cart: z.array(CartParametersSchema).optional().describe("Koszyk"),
  additional: AdditionalSchema.optional().describe(
    "Zbiór dodatkowych danych nt. transakcji i płatnika"
  ),
  PSU: PSUSchema.optional().describe(
    "Payment Service User. Obiekt wymagany przy wykorzystaniu metod blikChargeByCode lub blikChargeByAlias"
  ),
});

export const VerifyTransactionDataSchema = z.object({
  merchantId: z.number().int().describe("ID Sklepu"),
  posId: z.number().int().describe("ID Sklepu (domyślnie ID Sprzedawcy)"),
  sessionId: z
    .string()
    .max(100)
    .describe("Unikalny identyfikator z systemu sprzedawcy"),
  amount: z
    .number()
    .int()
    .describe("Kwota transakcji wyrażona w groszach, np. 1.23 PLN = 123"),
  currency: z.string().max(3).default("PLN").describe("Waluta"),
  orderId: z.number().int().describe("Id zamówienia z systemu Przelewy24"),
  sign: z
    .string()
    .describe(
      'Suma kontrolna parametrów: {"sessionId":"str","orderId":int,"amount":int,"currency":"str","crc":"str"} liczona z użyciem sha384'
    ),
});

export const TransactionNotificationDataSchema = z.object({
  merchantId: z.number().int().optional().describe("ID Merchanta"),
  posId: z
    .number()
    .int()
    .optional()
    .describe("ID Sklepu (domyślnie ID Merchanta)"),
  sessionId: z
    .string()
    .max(100)
    .optional()
    .describe("Unikalny identyfikator z systemu sprzedawcy"),
  amount: z
    .number()
    .int()
    .optional()
    .describe(
      "Wartość opłaconej transakcji wyrażona w groszach, np. 1.23 PLN = 123"
    ),
  originAmount: z
    .number()
    .int()
    .optional()
    .describe(
      "Wartość transakcji podczas rejestracji tokenu wyrażona w groszach, np. 1.23 PLN = 123"
    ),
  currency: z
    .string()
    .max(3)
    .default("PLN")
    .describe("Wartość zgodna z ISO np. PLN"),
  orderId: z
    .number()
    .int()
    .optional()
    .describe("Numer transakcji przypisany przez P24"),
  methodId: z
    .number()
    .int()
    .optional()
    .describe("Metoda płatności, z której skorzystał klient"),
  statement: z.string().optional().describe("Tytuł płatności"),
  sign: z
    .string()
    .optional()
    .describe(
      'Suma kontrolna parametrów: {"merchantId":int,"posId":int,"sessionId":"string","amount":int,"originAmount":int,"currency":"string","orderId":int,"methodId":int,"statement":"string","crc":"string"} liczona z użyciem sha384'
    ),
});

// Słownik kodów błędów Przelewy24
export const P24ErrorCodes = {
  err00: "Nieprawidłowe wywołanie skryptu",
  err01:
    "Nie uzyskano od sklepu potwierdzenia odebrania odpowiedzi autoryzacyjnej",
  err02: "Nie uzyskano odpowiedzi autoryzacyjnej",
  err03: "To zapytanie było już przetwarzane",
  err04: "Zapytanie autoryzacyjne niekompletne lub niepoprawne",
  err05: "Nie udało się odczytać konfiguracji sklepu internetowego",
  err06: "Nieudany zapis zapytania autoryzacyjnego",
  err07: "Inna osoba dokonuje płatności",
  err08: "Nieustalony status połączenia ze sklepem.",
  err09: "Przekroczono dozwoloną liczbę poprawek danych.",
  err10: "Nieprawidłowa kwota transakcji!",
  err49: "Zbyt wysoki wynik oceny ryzyka transakcji.",
  err51: "Nieprawidłowe wywołanie strony",
  err52: "Błędna informacja zwrotna o sesji!",
  err53: "Błąd transakcji !",
  err54: "Niezgodność kwoty transakcji!",
  err55: "Nieprawidłowy kod odpowiedzi!",
  err56: "Nieprawidłowa karta",
  err57: "Niezgodność flagi TEST!",
  err58: "Nieprawidłowy numer sekwencji!",
  err59: "Nieprawidłowa waluta transakcji!",
  err101:
    "Błąd wywołania strony W żądaniu transakcji brakuje któregoś z wymaganych parametrów lub pojawiła się niedopuszczalna wartość.",
  err102: "Minął czas na dokonanie transakcji",
  err103: "Nieprawidłowa kwota przelewu",
  err104: "Transakcja oczekuje na potwierdzenie.",
  err105: "Transakcja dokonana po dopuszczalnym czasie",
  err161:
    'Żądanie transakcji przerwane przez użytkownika Klient przerwał procedurę płatności wybierając przycisk "Powrót" na stronie wyboru formy płatności.',
  err162:
    'Żądanie transakcji przerwane przez użytkownika Klient przerwał procedurę płatności wybierając przycisk "Rezygnuj" na stronie z instrukcją płatności.',
} as const;

export type P24ErrorCode = keyof typeof P24ErrorCodes;

export type RegisterTransactionData = z.infer<
  typeof RegisterTransactionDataSchema
>;
export type VerifyTransactionData = z.infer<typeof VerifyTransactionDataSchema>;
export type TransactionNotificationData = z.infer<
  typeof TransactionNotificationDataSchema
>;
export type CartParameters = z.infer<typeof CartParametersSchema>;
export type Shipping = z.infer<typeof ShippingSchema>;
export type PSU = z.infer<typeof PSUSchema>;
export type Additional = z.infer<typeof AdditionalSchema>;
export type SignParamsForRegistration = z.infer<
  typeof SignParamsForRegistrationSchema
>;
export type SignParamsForVerification = z.infer<
  typeof SignParamsForVerificationSchema
>;
