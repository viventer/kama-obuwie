#!/bin/bash

# Test script dla synchronizacji Allegro w tle

echo "🧪 Test synchronizacji Allegro w tle"
echo "======================================"
echo ""

# Sprawdź czy zmienne środowiskowe są ustawione
if [ -z "$QSTASH_TOKEN" ]; then
    echo "❌ Błąd: QSTASH_TOKEN nie jest ustawiony"
    echo "   Dodaj do .env.local: QSTASH_TOKEN=twoj_token"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_APP_URL" ] && [ -z "$VERCEL_URL" ]; then
    echo "⚠️  Ostrzeżenie: NEXT_PUBLIC_APP_URL nie jest ustawiony"
    echo "   Dla testów lokalnych użyj ngrok: ngrok http 3000"
    echo ""
fi

# Sprawdź status przed testem
echo "📊 Status przed testem:"
curl -s http://localhost:3000/api/sync/allegro-offers/status | jq '.'
echo ""

echo "✅ Zmienne środowiskowe OK"
echo ""
echo "📝 Kolejne kroki:"
echo "   1. Upewnij się, że serwer działa: npm run dev"
echo "   2. Przejdź do: http://localhost:3000/admin-panel/offers/sync"
echo "   3. Kliknij przycisk synchronizacji"
echo "   4. Obserwuj logi w terminalu"
echo ""
echo "📡 Możesz także sprawdzić status przez API:"
echo "   curl http://localhost:3000/api/sync/allegro-offers/status | jq '.'"
