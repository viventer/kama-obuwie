import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { withRedisCommandLog } from "@/upstash/redis";
import {
  GMC_SYNC_KEY,
  getSyncJobState,
  patchSyncJobState,
  resetSyncJobState,
} from "@/upstash/syncJobState";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: NextRequest) {
  return withRedisCommandLog("gmc-availability-queue", async () => {
    try {
      console.log("🚀 Queueing GMC sync job to QStash...");

      const body = await req.json();
      const userId = body?.userId || null;
      const batch = body.batch ?? 0;

      console.log(`👤 Queueing sync batch: ${batch}`);

      if (batch === 0) {
        const current = await getSyncJobState(GMC_SYNC_KEY);
        if (current.status !== "running" && current.status !== "queued") {
          await resetSyncJobState(GMC_SYNC_KEY, {
            status: "queued",
            queued: new Date().toISOString(),
          });
        }
      }

      const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/gmc/availability/worker`;

      console.log(`📤 Publishing job to QStash: ${workerUrl}`);

      const result = await qstashClient.publishJSON({
        url: workerUrl,
        body: { userId, batch },
        retries: 2,
        timeout: "14m",
      });

      console.log(
        `✅ Job queued successfully with messageId: ${result.messageId} ( batch ${batch})`,
      );

      if (batch === 0) {
        await patchSyncJobState(GMC_SYNC_KEY, {
          jobId: result.messageId,
        });
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
  });
}
