/**
 * Zwraca aktualną datę i czas jako obiekt Date w polskiej strefie czasowej (Europe/Warsaw).
 * Użyj tej funkcji zamiast new Date() gdy potrzebujesz obiektu Date z polską godziną.
 *
 * @returns Obiekt Date z czasem w polskiej strefie czasowej
 */
export function getPolandDate(): Date {
  const now = new Date();

  // Pobierz czas w polskiej strefie jako string
  const polandTimeString = now.toLocaleString("en-US", {
    timeZone: "Europe/Warsaw",
  });

  // Stwórz nowy obiekt Date z tego stringu
  return new Date(polandTimeString);
}

/**
 * Zwraca aktualną datę i czas w polskiej strefie czasowej (Europe/Warsaw)
 * sformatowaną jako ISO string.
 *
 * @returns Data w formacie ISO z offsetem dla Polski (np. "2025-12-30T15:30:00.000+01:00")
 */
export function getCurrentDateTimeInPoland(): string {
  const now = new Date();

  // Formatuj datę do polskiej strefy czasowej
  const polandTime = new Intl.DateTimeFormat("pl-PL", {
    timeZone: "Europe/Warsaw",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    fractionalSecondDigits: 3,
    hour12: false,
  }).formatToParts(now);

  // Wyciągnij składowe daty
  const parts = Object.fromEntries(
    polandTime.map((part) => [part.type, part.value])
  );

  // Zbuduj ISO string z offsetem czasowym
  const year = parts.year;
  const month = parts.month;
  const day = parts.day;
  const hour = parts.hour;
  const minute = parts.minute;
  const second = parts.second;
  const millisecond = parts.fractionalSecond || "000";

  // Oblicz offset dla Polski (UTC+1 zimą, UTC+2 latem)
  const offset = getTimezoneOffset(now);

  return `${year}-${month}-${day}T${hour}:${minute}:${second}.${millisecond}${offset}`;
}

/**
 * Zwraca offset strefy czasowej dla Europe/Warsaw w formacie +HH:MM lub -HH:MM
 */
function getTimezoneOffset(date: Date): string {
  // Stwórz dwie daty - jedną w UTC, drugą w polskiej strefie
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }));
  const polandDate = new Date(
    date.toLocaleString("en-US", { timeZone: "Europe/Warsaw" })
  );

  // Oblicz różnicę w minutach
  const offsetMinutes =
    (polandDate.getTime() - utcDate.getTime()) / (1000 * 60);

  const hours = Math.floor(Math.abs(offsetMinutes) / 60);
  const minutes = Math.abs(offsetMinutes) % 60;

  const sign = offsetMinutes >= 0 ? "+" : "-";
  const hoursStr = String(hours).padStart(2, "0");
  const minutesStr = String(minutes).padStart(2, "0");

  return `${sign}${hoursStr}:${minutesStr}`;
}
