"use server";

import crypto from "crypto";

const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID!;
const P24_CRC = process.env.P24_CRC!;
const P24_BASE_URL = process.env.P24_BASE_URL!;
const P24_API_KEY = process.env.P24_API_KEY!;

function getP24Headers() {
  const credentials = Buffer.from(`${P24_MERCHANT_ID}:${P24_API_KEY}`).toString(
    "base64"
  );

  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  };
}

type SignParams = {
  sessionId: string;
  merchantId: string | null;
  orderId: number | null;
  amount: number;
  currency: string;
  crc: string;
};

function getSign(
  params: SignParams,
  type: "registration" | "verification"
): string {
  const combinedString = JSON.stringify(params);
  const hash = crypto.createHash("sha384").update(combinedString).digest("hex");
  return hash;
}
