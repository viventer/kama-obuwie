import { NextResponse } from "next/server";
import { redis } from "@/upstash/redis";

// Endpoint do sprawdzania statusu synchronizacji
export async function GET() {
  try {
    const status = await redis.get<string>("allegro:sync:status");
    const jobId = await redis.get<string>("allegro:sync:jobId");
    const started = await redis.get<string>("allegro:sync:started");
    const completed = await redis.get<string>("allegro:sync:completed");
    const queued = await redis.get<string>("allegro:sync:queued");
    const error = await redis.get<string>("allegro:sync:error");

    return NextResponse.json({
      status: status || "idle",
      jobId,
      started,
      completed,
      queued,
      error,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sync status",
      },
      { status: 500 }
    );
  }
}
