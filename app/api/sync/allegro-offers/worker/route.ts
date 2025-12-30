import { syncAllegroOffers } from "@/server-actions/allegro/syncOffers";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/upstash/redis";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";

async function handler(req: NextRequest) {
  try {
    console.log("🚀 QStash worker: Starting background Allegro sync job...");

    const body = await req.json();
    const userId = body?.userId || null;
    const batch = body.batch ?? 0;
    const channel = body.channel ?? "AL1";

    console.log(`👤 Running sync for channel: ${channel}, batch: ${batch}`);

    // Ustaw status na "running" tylko dla pierwszego batcha
    if (batch === 0 && channel === "AL1") {
      await redis.set("allegro:sync:status", "running");
      await redis.set("allegro:sync:started", new Date().toISOString());
      await redis.del("allegro:sync:progress"); // Wyczyść stary progress
    }

    // Wykonaj synchronizację dla tego batcha
    const result = await syncAllegroOffers(userId, channel, batch);

    // Sprawdź czy są kolejne batche do przetworzenia
    if (result.hasMore) {
      console.log(
        `🔗 Queueing next batch: ${result.nextBatch} for ${result.nextChannel}`
      );

      // Zakolejkuj następny batch
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/allegro-offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            batch: result.nextBatch,
            channel: result.nextChannel,
          }),
        }
      );

      if (!response.ok) {
        console.error(
          `❌ Failed to queue next batch: ${await response.text()}`
        );
      }
    } else {
      // To był ostatni batch - ustaw status na completed
      const hasAnySuccess = result.AL1?.success || result.AL2?.success;
      const status = hasAnySuccess ? "completed" : "error";

      await redis.set("allegro:sync:status", status);
      await redis.set("allegro:sync:completed", new Date().toISOString());
      await redis.set("allegro:sync:results", JSON.stringify(result));

      console.log("✅ QStash worker: All batches completed!");
    }

    console.log(
      "✅ QStash worker: Background Allegro sync job completed successfully"
    );

    return NextResponse.json({
      success: true,
      message: result.hasMore
        ? `Batch ${batch} completed, next batch queued`
        : "All batches completed",
      result,
    });
  } catch (error) {
    console.error(
      "❌ QStash worker: Background Allegro sync job failed:",
      error
    );

    await redis.set("allegro:sync:status", "error");
    await redis.set(
      "allegro:sync:error",
      error instanceof Error ? error.message : "Unknown error"
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

// Eksportuj handler jako POST - weryfikacja podpisu QStash wyłączona na razie
export const POST = handler;
