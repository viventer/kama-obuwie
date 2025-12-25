/**
 * Oblicza czas wysyłki w dniach na podstawie aktualnej daty
 * @param currentDate - aktualna data (opcjonalnie, domyślnie new Date())
 * @returns liczba dni potrzebnych na wysyłkę
 */
export function calculateShippingDays(currentDate: Date = new Date()): number {
  const dayOfWeek = currentDate.getDay(); // 0 = niedziela, 1 = poniedziałek, ..., 6 = sobota
  const hour = currentDate.getHours();
  const minute = currentDate.getMinutes();
  const currentTime = hour * 60 + minute; // czas w minutach od północy

  // Definiujemy czasy graniczne w minutach
  const TIME_13_00 = 13 * 60; // 13:00
  const TIME_08_00 = 8 * 60; // 08:00

  switch (dayOfWeek) {
    case 1: // Poniedziałek
    case 2: // Wtorek
    case 3: // Środa
      if (currentTime <= TIME_13_00) {
        return 1; // Pon-śr do 13:00 - 1 dzień
      } else {
        return 2; // Pon-śr po 13:00 - 2 dni
      }

    case 4: // Czwartek
      if (currentTime <= TIME_13_00) {
        return 1; // Czw do 13:00 - 1 dzień
      } else {
        return 4; // Czw po 13:00 - 4 dni
      }

    case 5: // Piątek
      if (currentTime <= TIME_13_00) {
        return 3; // Pt do 13:00 - 3 dni
      } else {
        return 3; // Pt po 13:00 - 3 dni
      }

    case 6: // Sobota
      if (currentTime <= TIME_08_00) {
        return 2; // Sb do 8:00 - 2 dni
      } else {
        return 3; // Sb po 8:00 - 3 dni
      }

    case 0: // Niedziela
      return 2; // Ndz - 2 dni

    default:
      return 2; // Domyślnie 2 dni (zabezpieczenie)
  }
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
