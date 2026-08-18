"use server";

import { Client } from "@upstash/qstash";
import { verifyUser, getCurrentUserId } from "../../auth/auth";
import {
  ALLEGRO_SYNC_KEY,
  getSyncJobState,
  parseSyncJobResults,
  patchSyncJobState,
  resetSyncJobState,
  type AllegroSyncResults,
} from "@/upstash/syncJobState";

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

  const current = await getSyncJobState(ALLEGRO_SYNC_KEY);
  if (current.status === "running") {
    throw new Error(
      "Synchronizacja jest już w toku. Poczekaj na zakończenie poprzedniej synchronizacji.",
    );
  }

  try {
    await resetSyncJobState(ALLEGRO_SYNC_KEY, {
      status: "queued",
      queued: new Date().toISOString(),
    });

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

    await patchSyncJobState(ALLEGRO_SYNC_KEY, {
      jobId: result.messageId,
    });

    return {
      success: true,
      jobId: result.messageId,
      message: "Synchronizacja została uruchomiona w tle",
    };
  } catch (error) {
    console.error("❌ Failed to trigger sync:", error);

    await patchSyncJobState(ALLEGRO_SYNC_KEY, {
      status: "error",
      error: error instanceof Error ? error.message : "Unknown error",
    });

    throw new Error(
      `Nie udało się uruchomić synchronizacji: ${
        error instanceof Error ? error.message : "Nieznany błąd"
      }`,
    );
  }
};

export const getAllegroSyncStatus = async () => {
  await verifyUser(["ADMIN", "VERIFIED"]);

  const state = await getSyncJobState(ALLEGRO_SYNC_KEY);

  return {
    status: state.status || "idle",
    jobId: state.jobId,
    started: state.started,
    completed: state.completed,
    queued: state.queued,
    error: state.error,
    results: parseSyncJobResults<AllegroSyncResults>(state.results),
  };
};
