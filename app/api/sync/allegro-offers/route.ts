import { NextRequest, NextResponse } from "next/server";
import { Client } from "@upstash/qstash";
import { withRedisCommandLog } from "@/upstash/redis";
import {
  ALLEGRO_SYNC_KEY,
  getSyncJobState,
  patchSyncJobState,
  resetSyncJobState,
} from "@/upstash/syncJobState";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export async function POST(req: NextRequest) {
  return withRedisCommandLog("allegro-offers-queue", async () => {
    try {
      console.log("🚀 Queueing Allegro sync job to QStash...");

      const body = await req.json();
      const userId = body?.userId || null;
      const batch = body.batch ?? 0;
      const channel = body.channel ?? "AL1";

      console.log(`👤 Queueing sync for channel: ${channel}, batch: ${batch}`);

      if (batch === 0 && channel === "AL1") {
        const current = await getSyncJobState(ALLEGRO_SYNC_KEY);
        if (current.status !== "running" && current.status !== "queued") {
          await resetSyncJobState(ALLEGRO_SYNC_KEY, {
            status: "queued",
            queued: new Date().toISOString(),
          });
        }
      }

      const workerUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sync/allegro-offers/worker`;

      console.log(`📤 Publishing job to QStash: ${workerUrl}`);

      const result = await qstashClient.publishJSON({
        url: workerUrl,
        body: { userId, batch, channel },
        retries: 2,
        timeout: "14m",
      });

      console.log(
        `✅ Job queued successfully with messageId: ${result.messageId} (${channel} batch ${batch})`,
      );

      if (batch === 0 && channel === "AL1") {
        await patchSyncJobState(ALLEGRO_SYNC_KEY, {
          jobId: result.messageId,
        });
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
  });
}
