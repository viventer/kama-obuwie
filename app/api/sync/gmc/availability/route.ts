import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/upstash/redis";
import { Client } from "@upstash/qstash";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: NextRequest) {
  try {
    console.log("🚀 Queueing GMC sync job to QStash...");

    const body = await req.json();
    const userId = body?.userId || null;
    const batch = body.batch ?? 0; // Default to batch 0 (start)

    console.log(`👤 Queueing sync batch: ${batch}`);

    // Ustaw status na "queued" tylko dla pierwszego batcha
    if (batch === 0) {
      await redis.set("gmc:sync:status", "queued");
      await redis.set("gmc:sync:queued", new Date().toISOString());
      await redis.del("gmc:sync:error");
      await redis.del("gmc:sync:results");
      await redis.del("gmc:sync:progress");
    }

    // Zakolejkuj job do QStash - zwróć odpowiedź natychmiast
    const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/gmc/availability/worker`;

    console.log(`📤 Publishing job to QStash: ${workerUrl}`);

    const result = await qstashClient.publishJSON({
      url: workerUrl,
      body: { userId, batch },
      retries: 2, // Retry do 2 razy w przypadku błędu
      timeout: "14m", // Maksymalnie 14 minut (limit free tier: 15 minut)
    });

    console.log(
      `✅ Job queued successfully with messageId: ${result.messageId} ( batch ${batch})`,
    );

    // Zapisz messageId do śledzenia tylko dla pierwszego batcha
    if (batch === 0) {
      await redis.set("gmc:sync:messageId", result.messageId);
    }

    return NextResponse.json({
      success: true,
      message:
        batch === 0
          ? "Synchronization job queued successfully. It will run in the background."
          : `Batch ${batch} queued successfully`,
      messageId: result.messageId,
      status: "queued",
      batch,
    });
  } catch (error) {
    console.error("❌ Failed to queue gmc sync job:", error);

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
