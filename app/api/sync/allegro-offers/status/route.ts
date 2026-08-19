import { NextResponse } from "next/server";
import {
  ALLEGRO_SYNC_KEY,
  getSyncJobState,
  parseSyncJobResults,
} from "@/upstash/syncJobState";

export async function GET() {
  try {
    const state = await getSyncJobState(ALLEGRO_SYNC_KEY);

    return NextResponse.json({
      status: state.status || "idle",
      jobId: state.jobId,
      started: state.started,
      completed: state.completed,
      queued: state.queued,
      error: state.error,
      results: parseSyncJobResults(state.results),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error fetching sync status:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch sync status",
      },
      { status: 500 },
    );
  }
}
