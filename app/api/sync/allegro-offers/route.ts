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
    const userId = body.userId;

    if (!userId) {
      console.error("❌ Missing userId in request body");
      return NextResponse.json(
        {
          success: false,
          error: "Missing userId in request body",
        },
        { status: 400 }
      );
    }

    console.log(`👤 Queueing sync for user: ${userId}`);

    // Ustaw status na "queued" zamiast "running"
    await redis.set("allegro:sync:status", "queued");
    await redis.set("allegro:sync:queued", new Date().toISOString());
    await redis.del("allegro:sync:error");
    await redis.del("allegro:sync:results");

    // Zakolejkuj job do QStash - zwróć odpowiedź natychmiast
    const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/allegro-offers/worker`;

    console.log(`📤 Publishing job to QStash: ${workerUrl}`);

    const result = await qstashClient.publishJSON({
      url: workerUrl,
      body: { userId },
      retries: 2, // Retry do 2 razy w przypadku błędu
      timeout: "14m", // Maksymalnie 14 minut (limit free tier: 15 minut)
    });

    console.log(
      `✅ Job queued successfully with messageId: ${result.messageId}`
    );

    // Zapisz messageId do śledzenia
    await redis.set("allegro:sync:messageId", result.messageId);

    return NextResponse.json({
      success: true,
      message:
        "Synchronization job queued successfully. It will run in the background.",
      messageId: result.messageId,
      status: "queued",
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
