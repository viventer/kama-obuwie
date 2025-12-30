import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/upstash/redis";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Queueing Allegro sync job to QStash...");

    const body = await req.json();
    const userId = body?.userId || null;
    const batch = body.batch ?? 0; // Default to batch 0 (start)
    const channel = body.channel ?? "AL1"; // Default to AL1, potem AL2

    console.log(`👤 Queueing sync for channel: ${channel}, batch: ${batch}`);

    // Ustaw status na "queued" tylko dla pierwszego batcha
    if (batch === 0 && channel === "AL1") {
      await redis.set("allegro:sync:status", "queued");
      await redis.set("allegro:sync:queued", new Date().toISOString());
      await redis.del("allegro:sync:error");
      await redis.del("allegro:sync:results");
      await redis.del("allegro:sync:progress:AL1");
      await redis.del("allegro:sync:progress:AL2");
    }

    // Zakolejkuj job do QStash - zwróć odpowiedź natychmiast
    const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/allegro-offers/worker`;

    console.log(`📤 Publishing job to QStash: ${workerUrl}`);

    const result = await qstashClient.publishJSON({
      url: workerUrl,
      body: { userId, batch, channel },
      retries: 2, // Retry do 2 razy w przypadku błędu
      timeout: "14m", // Maksymalnie 14 minut (limit free tier: 15 minut)
    });

    console.log(
      `✅ Job queued successfully with messageId: ${result.messageId} (${channel} batch ${batch})`
    );

    // Zapisz messageId do śledzenia tylko dla pierwszego batcha
    if (batch === 0 && channel === "AL1") {
      await redis.set("allegro:sync:messageId", result.messageId);
    }

    return NextResponse.json({
      success: true,
      message:
        batch === 0 && channel === "AL1"
          ? "Synchronization job queued successfully. It will run in the background."
          : `Batch ${batch} for ${channel} queued successfully`,
      messageId: result.messageId,
      status: "queued",
      batch,
      channel,
    });
  } catch (error) {
    console.error("❌ Failed to queue Allegro sync job:", error);

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
