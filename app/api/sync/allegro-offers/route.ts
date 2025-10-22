import { syncAllegroOffers } from "@/server-actions/allegro/syncOffers";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest, NextResponse } from "next/server";
import { redis } from "@/upstash/redis";

async function handler(req: NextRequest) {
  try {
    console.log("🚀 Starting background Allegro sync job...");

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

    console.log(`👤 Running sync for user: ${userId}`);

    await redis.set("allegro:sync:status", "running");
    await redis.set("allegro:sync:started", new Date().toISOString());

    const results = await syncAllegroOffers(userId);

    const hasAnySuccess = results.AL1.success || results.AL2.success;
    const status = hasAnySuccess ? "completed" : "error";

    await redis.set("allegro:sync:status", status);
    await redis.set("allegro:sync:completed", new Date().toISOString());

    await redis.set("allegro:sync:results", JSON.stringify(results));

    console.log("✅ Background Allegro sync job completed successfully");

    return NextResponse.json({
      success: hasAnySuccess,
      message: hasAnySuccess
        ? "Synchronization completed"
        : "Synchronization failed for all accounts",
      results,
    });
  } catch (error) {
    console.error("❌ Background Allegro sync job failed:", error);

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

// W produkcji: weryfikuj podpis QStash
// W deweloperze: pomiń weryfikację
export const POST =
  process.env.NODE_ENV === "production"
    ? verifySignatureAppRouter(handler)
    : handler;
