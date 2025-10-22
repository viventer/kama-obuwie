# Synchronizacja Ofert Allegro w Tle

## Problem

Poprzednio funkcja `syncAllegroOffers` zatrzymywała się gdy serwer Next.js restartował się (np. podczas zwiększania zasobów). Synchronizacja była wykonywana bezpośrednio w odpowiedzi HTTP, co powodowało timeout i przerywanie procesu.

## Rozwiązanie

Implementacja **Upstash QStash** - serverless message queue, która:

- ✅ Wykonuje zadania w tle niezależnie od serwera Next.js
- ✅ Automatycznie retry w przypadku błędów
- ✅ Przetrwuje restarty serwera
- ✅ Trackuje status synchronizacji w Redis

## Architektura

```
[Przycisk UI]
    ↓ kliknięcie
[triggerAllegroSync] (pobiera userId z sesji)
    ↓ wysyła zadanie z userId do
[Upstash QStash]
    ↓ wywołuje webhook z userId
[/api/sync/allegro-offers] (API route)
    ↓ wykonuje z userId
[syncAllegroOffers(userId)] (długotrwały proces)
    ↓ używa getAllegroAccessTokensForBackgroundJob(userId)
    ↓ zapisuje status w
[Redis] ← [UI] odczytuje status
```

### Kluczowe zmiany dla zadań w tle:

1. **Brak sesji cookie** - QStash wywołuje endpoint bez sesji użytkownika
2. **userId w payload** - przekazywany w body requestu do API
3. **Osobna funkcja auth** - `getAllegroAccessTokensForBackgroundJob()` zamiast `getAllegroUserAccessToken()`
4. **Tokeny z Firestore** - bezpośrednie pobieranie refresh tokenów z bazy danych## Konfiguracja

### 1. Utwórz konto Upstash QStash

Przejdź do: https://console.upstash.com/qstash

### 2. Pobierz Token

W dashboardzie QStash znajdziesz **QSTASH_TOKEN**

### 3. Dodaj zmienne środowiskowe

Skopiuj `.env.qstash.example` do `.env.local` i wypełnij:

```bash
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=https://twoja-domena.com
```

**Uwaga dla developmentu lokalnego:**

- QStash wymaga publicznie dostępnego URL
- Użyj [ngrok](https://ngrok.com/) lub [localtunnel](https://localtunnel.github.io/www/)
- Przykład z ngrok: `ngrok http 3000`, następnie ustaw `NEXT_PUBLIC_APP_URL=https://xxxx.ngrok.io`

### 4. Deploy na Vercel (produkcja)

Vercel automatycznie ustawi `VERCEL_URL`, więc nie musisz ustawiać `NEXT_PUBLIC_APP_URL` jeśli używasz domyślnej domeny Vercel.

Dodaj tylko:

```
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxx
```

## Użycie

### Frontend

Przejdź do: `/admin-panel/offers/sync`

Kliknij: **"Synchronizuj oferty z Allegro"**

UI automatycznie:

- ✅ Pokazuje status synchronizacji
- ✅ Odświeża status co 5 sekund
- ✅ Blokuje przycisk podczas synchronizacji
- ✅ Wyświetla błędy jeśli wystąpią

### Programatically

```typescript
import {
  triggerAllegroSync,
  getAllegroSyncStatus,
} from "@/server-actions/allegro/syncOffersBackground";

// Uruchom synchronizację
const result = await triggerAllegroSync();
console.log(result.jobId); // ID zadania w QStash

// Sprawdź status
const status = await getAllegroSyncStatus();
console.log(status.status); // 'idle' | 'queued' | 'running' | 'completed' | 'error'
```

## Statusy Synchronizacji

| Status      | Opis                               |
| ----------- | ---------------------------------- |
| `idle`      | Brak aktywnej synchronizacji       |
| `queued`    | Zadanie dodane do kolejki QStash   |
| `running`   | Synchronizacja w toku              |
| `completed` | Synchronizacja zakończona sukcesem |
| `error`     | Błąd podczas synchronizacji        |

## Monitorowanie

### Redis Keys

Status synchronizacji jest przechowywany w Redis:

```typescript
allegro: sync: status; // Aktualny status
allegro: sync: jobId; // ID zadania QStash
allegro: sync: queued; // Czas dodania do kolejki
allegro: sync: started; // Czas rozpoczęcia
allegro: sync: completed; // Czas zakończenia
allegro: sync: error; // Komunikat błędu (jeśli wystąpił)
```

### Logi

Logi są dostępne w:

- **Vercel Logs**: https://vercel.com/dashboard
- **QStash Logs**: https://console.upstash.com/qstash

## Limity

### Vercel

- **Hobby plan**: 10s timeout dla serverless functions
- **Pro plan**: 60s timeout
- **Enterprise**: 900s timeout

Ustaw `maxDuration` w `/app/api/sync/allegro-offers/route.ts`:

```typescript
export const maxDuration = 300; // 5 minut (wymaga Pro planu)
```

### QStash

- **Free tier**: 500 wiadomości/dzień
- **Pay as you go**: $1 za 100k wiadomości

## Troubleshooting

### Problem: "Synchronizacja jest już w toku"

**Rozwiązanie**: Poczekaj na zakończenie poprzedniej synchronizacji lub zresetuj status w Redis:

```typescript
await redis.set("allegro:sync:status", "idle");
```

### Problem: QStash nie może wywołać endpointa

**Rozwiązanie**:

- Sprawdź czy `NEXT_PUBLIC_APP_URL` jest poprawny
- W deweloperze upewnij się, że ngrok/tunnel działa
- Sprawdź logi w QStash console

### Problem: "verifySignature failed"

**Rozwiązanie**: W deweloperze weryfikacja jest wyłączona. W produkcji upewnij się, że `QSTASH_CURRENT_SIGNING_KEY` i `QSTASH_NEXT_SIGNING_KEY` są ustawione (pobierz z QStash console).

## Alternatywy

Jeśli QStash nie spełnia Twoich potrzeb, rozważ:

1. **Inngest** - https://www.inngest.com/ (darmowy tier, świetna DX)
2. **Firebase Cloud Functions** - jeśli już używasz Firebase
3. **Bull/BullMQ** - jeśli masz własny serwer Redis
4. **AWS SQS + Lambda** - dla większych projektów

## Pliki

- `app/api/sync/allegro-offers/route.ts` - Endpoint wykonujący synchronizację
- `server-actions/allegro/syncOffersBackground.ts` - Server actions do triggerowania/monitorowania
- `app/admin-panel/offers/sync/page.tsx` - UI do zarządzania synchronizacją
- `server-actions/allegro/syncOffers.ts` - Główna logika synchronizacji (bez zmian)
