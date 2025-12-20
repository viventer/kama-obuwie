import { syncAllegroOrders } from "@/server-actions/allegro/orders";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";

// Chroniona przez QStash weryfikacja podpisu
async function handler(req: NextRequest) {
  try {
    console.log(
      "[CRON] Rozpoczynam automatyczną synchronizację zamówień z Allegro..."
    );

    await syncAllegroOrders();

    console.log(
      "[CRON] Zakończono automatyczną synchronizację zamówień z Allegro"
    );

    return NextResponse.json({
      success: true,
      message: "Zamówienia zsynchronizowane",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[CRON] Błąd podczas automatycznej synchronizacji zamówień:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Nieznany błąd synchronizacji",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Owinięcie handlera weryfikacją QStash
// Jeśli nie używasz QStash lub testujesz lokalnie, zakomentuj tę linię i odkomentuj poniższą
// export const POST = verifySignatureAppRouter(handler);

// Dla testów lokalnych (bez weryfikacji QStash):
export async function POST(req: NextRequest) {
  return handler(req);
}
