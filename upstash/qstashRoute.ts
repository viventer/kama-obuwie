import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { NextRequest } from "next/server";
import { withRedisCommandLog } from "./redis";

type AppRouteHandler = (req: NextRequest) => Promise<Response>;

export function qstashPostHandler(
  label: string,
  handler: AppRouteHandler,
): (req: NextRequest | Request) => Promise<Response> {
  const loggedHandler = (req: NextRequest | Request) =>
    withRedisCommandLog(label, () => handler(req as NextRequest));

  if (
    process.env.QSTASH_CURRENT_SIGNING_KEY &&
    process.env.QSTASH_NEXT_SIGNING_KEY
  ) {
    return verifySignatureAppRouter(loggedHandler);
  }

  console.warn(
    `[${label}] QStash signature verification disabled: missing QSTASH_CURRENT_SIGNING_KEY / QSTASH_NEXT_SIGNING_KEY`,
  );
  return loggedHandler;
}
