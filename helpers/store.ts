/**
 * Oblicza datę Wielkanocy dla danego roku (algorytm Gaussa)
 * @param year - rok
 * @returns data Wielkanocy
 */
function calculateEaster(year: number): Date {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

/**
 * Sprawdza czy dany dzień jest świętem państwowym w Polsce
 * @param date - data do sprawdzenia
 * @returns true jeśli jest świętem, false w przeciwnym razie
 */
function isPolishHoliday(date: Date): boolean {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const dayOfWeek = date.getDay();

  // Niedziela jest zawsze wolna
  if (dayOfWeek === 0) {
    return true;
  }

  // Święta stałe
  const fixedHolidays = [
    { month: 0, day: 1 }, // 1 stycznia - Nowy Rok
    { month: 0, day: 6 }, // 6 stycznia - Trzech Króli
    { month: 4, day: 1 }, // 1 maja - Święto Pracy
    { month: 4, day: 3 }, // 3 maja - Święto Konstytucji 3 Maja
    { month: 7, day: 15 }, // 15 sierpnia - Wniebowzięcie NMP
    { month: 10, day: 1 }, // 1 listopada - Wszystkich Świętych
    { month: 10, day: 11 }, // 11 listopada - Święto Niepodległości
    { month: 11, day: 25 }, // 25 grudnia - Boże Narodzenie
    { month: 11, day: 26 }, // 26 grudnia - drugi dzień Bożego Narodzenia
  ];

  // Sprawdzenie świąt stałych
  for (const holiday of fixedHolidays) {
    if (month === holiday.month && day === holiday.day) {
      return true;
    }
  }

  // Święta ruchome (zależne od Wielkanocy)
  const easter = calculateEaster(year);
  const easterTime = easter.getTime();
  const dateTime = new Date(year, month, day).getTime();
  const oneDayMs = 24 * 60 * 60 * 1000;

  // Wielkanoc
  if (dateTime === easterTime) {
    return true;
  }

  // Poniedziałek Wielkanocny (1 dzień po Wielkanocy)
  if (dateTime === easterTime + oneDayMs) {
    return true;
  }

  // Zielone Świątki (49 dni po Wielkanocy)
  if (dateTime === easterTime + 49 * oneDayMs) {
    return true;
  }

  // Boże Ciało (60 dni po Wielkanocy)
  if (dateTime === easterTime + 60 * oneDayMs) {
    return true;
  }

  return false;
}

/**
 * Oblicza czas wysyłki w dniach na podstawie aktualnej daty (uwzględnia święta)
 * @param currentDate - aktualna data (opcjonalnie, domyślnie new Date())
 * @returns liczba dni potrzebnych na wysyłkę
 */
export function calculateShippingDays(currentDate: Date = new Date()): number {
  // Jeśli aktualny dzień jest świętem (nie niedzielą, bo niedziela jest już obsłużona jako dayOfWeek=0),
  // traktujemy go jak sobotę po 8:00
  const dayOfWeek = currentDate.getDay();
  if (dayOfWeek !== 0 && isPolishHoliday(currentDate)) {
    return 3; // Święto - 3 dni
  }

  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();
  const currentTime = hour * 60 + minute; // czas w minutach od północy

  // Definiujemy czasy graniczne w minutach
  const TIME_13_00 = 13 * 60; // 13:00
  const TIME_08_00 = 8 * 60; // 08:00

  let baseDays: number;

  switch (dayOfWeek) {
    case 1: // Poniedziałek
    case 2: // Wtorek
    case 3: // Środa
      baseDays = currentTime <= TIME_13_00 ? 1 : 2;
      break;

    case 4: // Czwartek
      baseDays = currentTime <= TIME_13_00 ? 1 : 4;
      break;

    case 5: // Piątek
      baseDays = 3; // zawsze 3 dni
      break;

    case 6: // Sobota
      baseDays = currentTime <= TIME_08_00 ? 2 : 3;
      break;

    case 0: // Niedziela
      baseDays = 2;
      break;

    default:
      baseDays = 2; // Domyślnie 2 dni (zabezpieczenie)
  }

  // Sprawdzamy czy w okresie dostawy wypada święto i dodajemy dni
  let daysCount = baseDays;
  const testDate = new Date(currentDate);

  for (let i = 1; i <= daysCount; i++) {
    testDate.setDate(currentDate.getDate() + i);
    // Jeśli dzień dostawy wypada w święto (ale nie niedzielę, bo niedziela jest już uwzględniona),
    // dodajemy jeden dzień do licznika
    if (testDate.getDay() !== 0 && isPolishHoliday(testDate)) {
      daysCount++;
    }
  }

  return daysCount;
}

/**
 * Oblicza datę wysyłki na podstawie aktualnej daty
 * @param currentDate - aktualna data (opcjonalnie, domyślnie new Date())
 * @returns data wysyłki
 */
export function calculateShippingDate(currentDate: Date = new Date()): Date {
  const shippingDays = calculateShippingDays(currentDate);
  const shippingDate = new Date(currentDate);
  shippingDate.setDate(shippingDate.getDate() + shippingDays);
  return shippingDate;
}

/**
 * Formatuje datę wysyłki do czytelnej postaci
 * @param currentDate - aktualna data (opcjonalnie, domyślnie new Date())
 * @returns sformatowany tekst z informacją o wysyłce
 */
export function getShippingInfo(
  currentDate: Date = new Date(),
  emailFormat: boolean = false
): string {
  const shippingDays = calculateShippingDays(currentDate);
  const shippingDate = calculateShippingDate(currentDate);

  // Sprawdzenie czy dostawa jest jutro (1 dzień)
  if (shippingDays === 1 && !emailFormat) {
    return "Kup do 13:00 - dostawa jutro";
  } else if (shippingDays === 1 && emailFormat) {
    return "U Ciebie jutro";
  }

  // Sprawdzenie czy dostawa jest pojutrze (2 dni)
  if (shippingDays === 2) {
    return "U Ciebie pojutrze";
  }

  // Dla pozostałych przypadków (3+ dni) używamy nazwy dnia
  const dayNames = [
    "w niedzielę",
    "w poniedziałek",
    "we wtorek",
    "w środę",
    "w czwartek",
    "w piątek",
    "w sobotę",
  ];
  const dayName = dayNames[shippingDate.getDay()];

  return `U Ciebie ${dayName}`;
}
