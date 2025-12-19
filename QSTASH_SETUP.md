# Konfiguracja QStash dla synchronizacji Allegro

## 1. Utwórz konto Upstash i uzyskaj klucze

1. Wejdź na https://console.upstash.com/
2. Przejdź do sekcji **QStash**
3. Skopiuj następujące zmienne:
   - `QSTASH_TOKEN` - token do publikowania zadań
   - `QSTASH_CURRENT_SIGNING_KEY` - klucz do weryfikacji podpisów (dla produkcji)
   - `QSTASH_NEXT_SIGNING_KEY` - następny klucz (dla produkcji)

## 2. Dodaj zmienne środowiskowe

### Lokalnie (.env.local):

```env
QSTASH_TOKEN=your_qstash_token_here
QSTASH_CURRENT_SIGNING_KEY=your_current_signing_key_here
QSTASH_NEXT_SIGNING_KEY=your_next_signing_key_here
```

### Firebase Hosting:

```bash
# Jeśli używasz Firebase Functions, dodaj zmienne w konsoli Firebase:
firebase functions:config:set qstash.token="your_qstash_token_here"
firebase functions:config:set qstash.current_signing_key="your_current_signing_key_here"
firebase functions:config:set qstash.next_signing_key="your_next_signing_key_here"

# Lub jeśli używasz pliku .env w Firebase:
# Dodaj je do pliku .env.production
```

## 3. Jak używać

### Wywołanie synchronizacji:

```typescript
const response = await fetch("/api/sync/allegro-offers", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ userId: "user-id-here" }),
});

const result = await response.json();
console.log(result.messageId); // ID zadania w QStash
```

### Sprawdzanie statusu:

```typescript
// Status jest zapisywany w Redis
const status = await redis.get("allegro:sync:status");
// Możliwe wartości: "queued", "running", "completed", "error"

const progressAL1 = await redis.get("allegro:sync:progress:AL1");
const progressAL2 = await redis.get("allegro:sync:progress:AL2");
```

## 4. Monitorowanie w Upstash Console

- Dashboard QStash pokazuje wszystkie zadania
- Możesz zobaczyć historię wykonań, błędy, retry
- Logi są dostępne dla każdego zadania

## 5. Ważne uwagi

- Timeout ustawiony na 30 minut
- Automatyczne retry: 2 próby w przypadku błędu
- Delay między requestami: 150ms (aby uniknąć rate limiting)
- Worker endpoint: `/api/sync/allegro-offers/worker`
- Weryfikacja podpisu włączona tylko w produkcji

## 6. Troubleshooting

### Błąd: "Missing QSTASH_TOKEN"

- Sprawdź czy zmienne środowiskowe są ustawione
- Zrestartuj serwer deweloperski

### Błąd: "Invalid signature"

- W deweloperze weryfikacja jest wyłączona
- W produkcji sprawdź czy QSTASH_CURRENT_SIGNING_KEY jest poprawny

### Synchronizacja się nie kończy

- Sprawdź logi w Upstash Console
- Sprawdź status w Redis: `redis.get('allegro:sync:status')`
- Sprawdź błędy: `redis.get('allegro:sync:error')`
