"use server";

const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID!;
const P24_CRC = process.env.P24_CRC!;
const P24_BASE_URL = process.env.P24_BASE_URL!;
const P24_API_KEY = process.env.P24_API_KEY!;

function getP24Headers() {
  return {
    "Content-Type": "application/json",
    Authorization: `Basic`,
  };
}
