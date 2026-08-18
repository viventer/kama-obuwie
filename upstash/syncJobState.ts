import { redis } from "./redis";

export const ALLEGRO_SYNC_KEY = "allegro:sync";
export const GMC_SYNC_KEY = "gmc:sync";

const SYNC_JOB_TTL_SECONDS = 7 * 24 * 60 * 60;

export type SyncJobState = {
  status?: string;
  queued?: string;
  started?: string;
  completed?: string;
  error?: string;
  results?: string;
  jobId?: string;
  lastChannel?: string;
  lastBatch?: string;
  nextChannel?: string;
  nextBatch?: string;
};

function toStringFields(fields: SyncJobState): Record<string, string> {
  const payload: Record<string, string> = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) {
      payload[key] = value;
    }
  }
  return payload;
}

function parseHash(raw: Record<string, unknown> | null): SyncJobState {
  if (!raw) {
    return {};
  }

  const state: SyncJobState = {};
  for (const [key, value] of Object.entries(raw)) {
    if (value === null || value === undefined) {
      continue;
    }
    if (typeof value === "object") {
      state[key as keyof SyncJobState] = JSON.stringify(value);
      continue;
    }
    state[key as keyof SyncJobState] = String(value);
  }
  return state;
}

export async function getSyncJobState(key: string): Promise<SyncJobState> {
  const raw = await redis.hgetall<Record<string, unknown>>(key);
  return parseHash(raw);
}

export async function patchSyncJobState(
  key: string,
  fields: SyncJobState,
): Promise<void> {
  const payload = toStringFields(fields);
  if (Object.keys(payload).length === 0) {
    return;
  }
  await redis.hset(key, payload);
  await redis.expire(key, SYNC_JOB_TTL_SECONDS);
}

export async function resetSyncJobState(
  key: string,
  fields: SyncJobState,
): Promise<void> {
  await redis.del(key);
  await patchSyncJobState(key, fields);
}

export type AllegroSyncChannelResult = {
  success?: boolean;
  offersCount?: number;
  error?: string;
};

export type AllegroSyncResults = {
  AL1?: AllegroSyncChannelResult;
  AL2?: AllegroSyncChannelResult;
};

export function parseSyncJobResults<T = unknown>(
  resultsRaw: string | undefined,
): T | null {
  if (!resultsRaw) {
    return null;
  }

  try {
    return JSON.parse(resultsRaw) as T;
  } catch (error) {
    console.error("Failed to parse sync results:", error);
    return null;
  }
}

export function isAllegroBatchAlreadyProcessed(
  incoming: { channel: string; batch: number },
  state: SyncJobState,
): boolean {
  if (state.lastBatch === undefined || !state.lastChannel) {
    return false;
  }

  const lastBatch = Number(state.lastBatch);
  if (Number.isNaN(lastBatch)) {
    return false;
  }

  const channelOrder: Record<string, number> = { AL1: 0, AL2: 1 };
  const incomingOrder = channelOrder[incoming.channel];
  const lastOrder = channelOrder[state.lastChannel];
  if (incomingOrder === undefined || lastOrder === undefined) {
    return false;
  }

  if (incomingOrder < lastOrder) {
    return true;
  }

  return incoming.channel === state.lastChannel && incoming.batch <= lastBatch;
}

export function isGmcBatchAlreadyProcessed(
  batch: number,
  state: SyncJobState,
): boolean {
  if (state.lastBatch === undefined) {
    return false;
  }
  const lastBatch = Number(state.lastBatch);
  if (Number.isNaN(lastBatch)) {
    return false;
  }
  return batch <= lastBatch;
}
