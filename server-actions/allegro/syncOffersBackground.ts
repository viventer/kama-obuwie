"use server";

import { Client } from "@upstash/qstash";
import { verifyUser, getCurrentUserId } from "../auth/auth";
import { redis } from "@/upstash/redis";

const qstashClient = new Client({
  token: process.env.QSTASH_TOKEN!,
});

/**
 * Uruchamia synchronizację ofert Allegro w tle przy użyciu QStash.
 * Zadanie będzie kontynuowane nawet jeśli serwer się zrestartuje.
 */
export const triggerAllegroSync = async () => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("Nie można zidentyfikować użytkownika");
  }

  const currentStatus = await redis.get("allegro:sync:status");
  if (currentStatus === "running") {
    throw new Error(
      "Synchronizacja jest już w toku. Poczekaj na zakończenie poprzedniej synchronizacji."
    );
  }

  try {
    await redis.set("allegro:sync:status", "queued");
    await redis.set("allegro:sync:queued", new Date().toISOString());

    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const url = `${
      baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`
    }/api/sync/allegro-offers`;

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

    await redis.set("allegro:sync:jobId", result.messageId);

    return {
      success: true,
      jobId: result.messageId,
      message: "Synchronizacja została uruchomiona w tle",
    };
  } catch (error) {
    console.error("❌ Failed to trigger sync:", error);

    await redis.set("allegro:sync:status", "error");
    await redis.set(
      "allegro:sync:error",
      error instanceof Error ? error.message : "Unknown error"
    );

    throw new Error(
      `Nie udało się uruchomić synchronizacji: ${
        error instanceof Error ? error.message : "Nieznany błąd"
      }`
    );
  }
};

export const getAllegroSyncStatus = async () => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const status = await redis.get<string>("allegro:sync:status");
  const jobId = await redis.get<string>("allegro:sync:jobId");
  const started = await redis.get<string>("allegro:sync:started");
  const completed = await redis.get<string>("allegro:sync:completed");
  const queued = await redis.get<string>("allegro:sync:queued");
  const error = await redis.get<string>("allegro:sync:error");
  const resultsRaw = await redis.get("allegro:sync:results");

  let results = null;
  if (resultsRaw) {
    // Jeśli Redis już zdeserializował obiekt, użyj go bezpośrednio
    if (typeof resultsRaw === "object") {
      results = resultsRaw;
    } else if (typeof resultsRaw === "string") {
      // Jeśli to string, spróbuj sparsować
      try {
        results = JSON.parse(resultsRaw);
      } catch (e) {
        console.error("Failed to parse sync results:", e);
      }
    }
  }

  return {
    status: status || "idle",
    jobId,
    started,
    completed,
    queued,
    error,
    results,
  };
};
