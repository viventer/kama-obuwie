# 🚀 Quick Start - Synchronizacja w Tle

## Szybka konfiguracja (5 minut)

### 1️⃣ Zarejestruj się w Upstash QStash

```bash
# Otwórz w przeglądarce:
https://console.upstash.com/qstash
```

### 2️⃣ Skopiuj Token

W dashboardzie QStash kliknij **"QSTASH_TOKEN"** i skopiuj wartość.

### 3️⃣ Dodaj do zmiennych środowiskowych

**Lokalne środowisko (.env.local):**

```bash
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxx
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Dla testów lokalnych użyj ngrok!
```

**Produkcja (Vercel Dashboard):**

```bash
QSTASH_TOKEN=qstash_xxxxxxxxxxxxxxxx
# NEXT_PUBLIC_APP_URL nie jest potrzebny na Vercel
```

### 4️⃣ Zrestartuj serwer deweloperski

```bash
npm run dev
```

### 5️⃣ Testuj!

1. Przejdź do: http://localhost:3000/admin-panel/offers/sync
2. Kliknij: **"Synchronizuj oferty z Allegro"**
3. Obserwuj status w czasie rzeczywistym

## ⚠️ Ważne dla developmentu lokalnego

QStash wymaga **publicznie dostępnego URL**. Użyj ngrok:

```bash
# Zainstaluj ngrok
npm install -g ngrok

# Uruchom tunel
ngrok http 3000

# Skopiuj URL (np. https://abc123.ngrok.io)
# Ustaw w .env.local:
NEXT_PUBLIC_APP_URL=https://abc123.ngrok.io
```

## ✅ Gotowe!

Synchronizacja będzie działać w tle i przetrwa restarty serwera.

Więcej informacji: [ALLEGRO_SYNC_BACKGROUND.md](./ALLEGRO_SYNC_BACKGROUND.md)
