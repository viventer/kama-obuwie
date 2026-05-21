"use server";

import { Client } from "@upstash/qstash";
import { verifyUser, getCurrentUserId } from "../../auth/auth";
import { redis } from "@/upstash/redis";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export const triggerGMCSync = async () => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Nie można zidentyfikować użytkownika");
  }

  const currentStatus = await redis.get("gmc:sync:status");
  if (currentStatus === "running") {
    throw new Error(
      "Synchronizacja jest już w toku. Poczekaj na zakończenie poprzedniej synchronizacji.",
    );
  }

  try {
    await redis.set("gmc:sync:status", "queued");
    await redis.set("gmc:sync:queued", new Date().toISOString());

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${
      baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`
    }/api/sync/gmc/availability`;

    console.log(`🚀 Triggering background sync to: ${url}`);

    const result = await qstashClient.publishJSON({
      url,
      body: {
        triggeredAt: new Date().toISOString(),
        userId,
      },
      retries: 2,
    });

    console.log(`✅ Sync job queued with ID: ${result.messageId}`);

    await redis.set("gmc:sync:jobId", result.messageId);

    return {
      success: true,
      jobId: result.messageId,
      message: "Synchronizacja została uruchomiona w tle",
    };
  } catch (error) {
    console.error("❌ Failed to trigger sync:", error);

    await redis.set("gmc:sync:status", "error");
    await redis.set(
      "gmc:sync:error",
      error instanceof Error ? error.message : "Unknown error",
    );

    throw new Error(
      `Nie udało się uruchomić synchronizacji: ${
        error instanceof Error ? error.message : "Nieznany błąd"
      }`,
    );
  }
};

export const syncGMCAvailability = async (userId: string, batch: number) => {
  const BATCH_SIZE = 50;

  console.log(
    `🚀 Starting GMC availability synchronization for user ${userId}, batch ${batch}...`,
  );
};
