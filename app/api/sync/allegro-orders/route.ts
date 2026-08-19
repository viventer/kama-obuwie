import { syncAllegroOrders } from "@/server-actions/allegro/orders";
import { NextRequest, NextResponse } from "next/server";
import { qstashPostHandler } from "@/upstash/qstashRoute";

async function handler(_req: NextRequest) {
  try {
    console.log(
      "[CRON] Rozpoczynam automatyczną synchronizację zamówień z Allegro...",
    );

    await syncAllegroOrders();

    console.log(
      "[CRON] Zakończono automatyczną synchronizację zamówień z Allegro",
    );

    return NextResponse.json({
      success: true,
      message: "Zamówienia zsynchronizowane",
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "[CRON] Błąd podczas automatycznej synchronizacji zamówień:",
      error,
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
      { status: 500 },
    );
  }
}

export const POST = qstashPostHandler("allegro-orders-cron", handler);
