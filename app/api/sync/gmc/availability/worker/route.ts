import { syncAllegroOffers } from "@/server-actions/allegro/sync/syncOffers";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/upstash/redis";

async function handler(req: NextRequest) {
  try {
    console.log("🚀 QStash worker: Starting background GMC sync job...");

    const body = await req.json();
    const userId = body?.userId || null;
    const batch = body.batch ?? 0;

    console.log(`👤 Running sync  batch: ${batch}`);

    // Ustaw status na "running" tylko dla pierwszego batcha
    if (batch === 0) {
      await redis.set("gmc:sync:status", "running");
      await redis.set("gmc:sync:started", new Date().toISOString());
      await redis.del("gmc:sync:progress"); // Wyczyść stary progress
    }

    // Wykonaj synchronizację dla tego batcha
    const result = await syncAllegroOffers(userId, batch);

    // Sprawdź czy są kolejne batche do przetworzenia
    if (result.hasMore) {
      console.log(`🔗 Queueing next batch: ${result.nextBatch}`);

      // Zakolejkuj następny batch
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/gmc:offers`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            batch: result.nextBatch,
          }),
        },
      );

      if (!response.ok) {
        console.error(
          `❌ Failed to queue next batch: ${await response.text()}`,
        );
      }
    } else {
      // To był ostatni batch - ustaw status na completed
      const hasAnySuccess = result.AL1?.success || result.AL2?.success;
      const status = hasAnySuccess ? "completed" : "error";

      await redis.set("gmc:sync:status", status);
      await redis.set("gmc:sync:completed", new Date().toISOString());
      await redis.set("gmc:sync:results", JSON.stringify(result));

      console.log("✅ QStash worker: All batches completed!");
    }

    console.log(
      "✅ QStash worker: Background GMC sync job completed successfully",
    );

    return NextResponse.json({
      success: true,
      message: result.hasMore
        ? `Batch ${batch} completed, next batch queued`
        : "All batches completed",
      result,
    });
  } catch (error) {
    console.error("❌ QStash worker: Background GMC sync job failed:", error);

    await redis.set("gmc:sync:status", "error");
    await redis.set(
      "gmc:sync:error",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const POST = handler;
