import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { syncGMCAvailability } from "@/server-actions/allegro/sync/syncGMCAvailability";
import { qstashPostHandler } from "@/upstash/qstashRoute";
import {
  GMC_SYNC_KEY,
  getSyncJobState,
  isGmcBatchAlreadyProcessed,
  patchSyncJobState,
} from "@/upstash/syncJobState";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

async function handler(req: NextRequest) {
  const body = await req.json();
  const batch = body.batch ?? 0;

  console.log(`[SYNC] gmc/availability worker batch=${batch}`);

  const state = await getSyncJobState(GMC_SYNC_KEY);
  if (isGmcBatchAlreadyProcessed(batch, state)) {
    console.log(`[SYNC] skipping already processed GMC batch ${batch}`);
    return NextResponse.json({
      success: true,
      skipped: true,
      batch,
    });
  }

  if (batch === 0) {
    await patchSyncJobState(GMC_SYNC_KEY, {
      status: "running",
      started: new Date().toISOString(),
      error: "",
    });
  }

  try {
    const result = await syncGMCAvailability(batch);

    await patchSyncJobState(GMC_SYNC_KEY, {
      lastBatch: String(batch),
      nextBatch:
        result.nextBatch !== null && result.nextBatch !== undefined
          ? String(result.nextBatch)
          : "",
    });

    if (result.hasMore) {
      console.log(`🔗 Queueing next batch: ${result.nextBatch}`);

      const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/gmc/availability/worker`;
      await qstashClient.publishJSON({
        url: workerUrl,
        body: { batch: result.nextBatch },
        retries: 2,
        timeout: "14m",
      });
    } else {
      await patchSyncJobState(GMC_SYNC_KEY, {
        status: result.success ? "completed" : "error",
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
    console.error("❌ QStash worker: Background GMC sync job failed:", error);

    await patchSyncJobState(GMC_SYNC_KEY, {
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

export const POST = qstashPostHandler("gmc-availability-worker", handler);
