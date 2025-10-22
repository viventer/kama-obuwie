# Changelog - Synchronizacja w tle

## Najnowsze zmiany (fix dla zadań w tle)

### Problem

QStash wywołuje endpoint API bez sesji użytkownika (brak cookies), co powodowało błąd:

```
Error: NEXT_REDIRECT
at getAllegroUserAccessTokens
redirect("/admin-auth/login")
```

### Rozwiązanie

#### 1. Nowa funkcja autoryzacji bez sesji

**Plik:** `server-actions/allegro/auth.ts`

- ✅ Dodano `getAllegroAccessTokensForBackgroundJob(userId)` - pobiera tokeny bez sesji
- ✅ Dodano `getCurrentUserId()` - pomocnicza funkcja do pobierania userId z sesji

#### 2. Przekazywanie userId przez QStash

**Plik:** `server-actions/allegro/syncOffersBackground.ts`

- ✅ `triggerAllegroSync()` pobiera userId przed wysłaniem do QStash
- ✅ userId jest przekazywany w body requestu

#### 3. Wsparcie dla userId w synchronizacji

**Plik:** `server-actions/allegro/syncOffers.ts`

- ✅ `syncAllegroOffers(userId?)` - opcjonalny parametr userId
- ✅ `getAllAllegroOffers(channel, userId?)` - wybór metody auth na podstawie userId
- ✅ Pomiń `verifyUser()` jeśli userId jest podany (zadanie w tle)

#### 4. API route używa userId z body

**Plik:** `app/api/sync/allegro-offers/route.ts`

- ✅ Pobiera userId z `req.json()`
- ✅ Wywołuje `syncAllegroOffers(userId)`
- ✅ Walidacja obecności userId

### Jak to działa teraz:

1. **UI** → Użytkownik klika przycisk synchronizacji
2. **triggerAllegroSync()** → Pobiera userId z sesji użytkownika
3. **QStash** → Otrzymuje zadanie z userId w payload
4. **API Route** → Otrzymuje webhook od QStash z userId
5. **syncAllegroOffers(userId)** → Używa `getAllegroAccessTokensForBackgroundJob(userId)`
6. **Auth** → Pobiera tokeny bezpośrednio z Firestore (nie wymaga sesji)
7. **Redis** → Status synchronizacji jest dostępny dla UI

### Pliki zmodyfikowane:

- ✅ `server-actions/allegro/auth.ts` (+103 linie)
- ✅ `server-actions/allegro/syncOffers.ts` (zmiany w importach i parametrach)
- ✅ `server-actions/allegro/syncOffersBackground.ts` (+7 linii)
- ✅ `app/api/sync/allegro-offers/route.ts` (+13 linii)

### Testowanie:

```bash
# 1. Upewnij się że serwer działa
npm run dev

# 2. Upewnij się że ngrok działa
ngrok http 3000

# 3. Ustaw NEXT_PUBLIC_APP_URL w .env.local
NEXT_PUBLIC_APP_URL=https://twoj-url.ngrok.io

# 4. Zaloguj się do aplikacji

# 5. Przejdź do /admin-panel/offers/sync

# 6. Kliknij "Synchronizuj oferty z Allegro"

# 7. Sprawdź logi - nie powinno być błędu NEXT_REDIRECT
```

### Co dalej:

Synchronizacja powinna teraz działać bez problemów w tle, nawet po restartach serwera! 🎉
