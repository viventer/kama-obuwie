import { syncAllegroOffers } from "@/server-actions/allegro/sync/syncOffers";
import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { qstashPostHandler } from "@/upstash/qstashRoute";
import {
  ALLEGRO_SYNC_KEY,
  getSyncJobState,
  isAllegroBatchAlreadyProcessed,
  patchSyncJobState,
} from "@/upstash/syncJobState";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

async function handler(req: NextRequest) {
  const body = await req.json();
  const userId = body?.userId || null;
  const batch = body.batch ?? 0;
  const channel = body.channel ?? "AL1";

  console.log(
    `[SYNC] allegro-offers worker channel=${channel} batch=${batch}`,
  );

  const state = await getSyncJobState(ALLEGRO_SYNC_KEY);
  if (isAllegroBatchAlreadyProcessed({ channel, batch }, state)) {
    console.log(
      `[SYNC] skipping already processed ${channel} batch ${batch}`,
    );
    return NextResponse.json({
      success: true,
      skipped: true,
      channel,
      batch,
    });
  }

  if (batch === 0 && channel === "AL1") {
    await patchSyncJobState(ALLEGRO_SYNC_KEY, {
      status: "running",
      started: new Date().toISOString(),
      error: "",
    });
  }

  try {
    const result = await syncAllegroOffers(userId, channel, batch);

    await patchSyncJobState(ALLEGRO_SYNC_KEY, {
      lastChannel: channel,
      lastBatch: String(batch),
      nextChannel: result.nextChannel ?? "",
      nextBatch:
        result.nextBatch !== null && result.nextBatch !== undefined
          ? String(result.nextBatch)
          : "",
    });

    if (result.hasMore) {
      console.log(
        `🔗 Queueing next batch: ${result.nextBatch} for ${result.nextChannel}`,
      );

      const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/allegro-offers/worker`;
      await qstashClient.publishJSON({
        url: workerUrl,
        body: {
          userId,
          batch: result.nextBatch,
          channel: result.nextChannel,
        },
        retries: 2,
        timeout: "14m",
      });
    } else {
      const hasAnySuccess = result.AL1?.success || result.AL2?.success;
      await patchSyncJobState(ALLEGRO_SYNC_KEY, {
        status: hasAnySuccess ? "completed" : "error",
        completed: new Date().toISOString(),
        results: JSON.stringify(result),
      });
      console.log("✅ QStash worker: All batches completed!");
    }

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
      error,
    );

    await patchSyncJobState(ALLEGRO_SYNC_KEY, {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}

export const POST = qstashPostHandler("allegro-offers-worker", handler);
