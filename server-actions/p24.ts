"use server";

import {
  RegisterTransactionData,
  SignParamsForRegistration,
  SignParamsForRegistrationSchema,
  SignParamsForVerification,
  SignParamsForVerificationSchema,
  VerifyTransactionData,
} from "@/firebase/schemas/p24Schemas";
import axios from "axios";
import crypto from "crypto";
import { handleP24ApiError } from "./errorHandlers";

const P24_MERCHANT_ID = process.env.P24_MERCHANT_ID!;
const P24_CRC = process.env.P24_CRC!;
const P24_BASE_URL = process.env.NEXT_PUBLIC_P24_API_BASE_URL!;
const P24_API_KEY = process.env.P24_API_KEY!;
const APP_BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

function getP24Headers() {
  const credentials = Buffer.from(`${P24_MERCHANT_ID}:${P24_API_KEY}`).toString(
    "base64"
  );

  return {
    "Content-Type": "application/json",
    Authorization: `Basic ${credentials}`,
  };
}

function getSign(
  type: "registration" | "verification",
  sessionId: string,
  amount: number,
  orderId?: number
): string {
  const params = {
    sessionId,
    amount,
    currency: "PLN",
    crc: P24_CRC,
  };
  let fullParams: SignParamsForRegistration | SignParamsForVerification;
  if (type === "verification" && orderId) {
    fullParams = { ...params, orderId };
    SignParamsForVerificationSchema.parse(fullParams);
  } else if (type === "registration") {
    fullParams = { ...params, merchantId: P24_MERCHANT_ID };
    SignParamsForRegistrationSchema.parse(fullParams);
  } else {
    throw new Error("Invalid parameters for sign generation");
  }
  const combinedString = JSON.stringify(params);
  const hash = crypto.createHash("sha384").update(combinedString).digest("hex");
  return hash;
}

export async function registerTransaction(
  transactionData: Pick<
    RegisterTransactionData,
    "amount" | "email" | "channel" | "regulationAccept"
  >
): Promise<{
  token: string;
  sessionId: string;
}> {
  const sessionId = crypto.randomBytes(16).toString("hex");
  const sign = getSign("registration", sessionId, transactionData.amount);

  const requestBody: RegisterTransactionData = {
    merchantId: Number(P24_MERCHANT_ID),
    posId: Number(P24_MERCHANT_ID),
    sessionId,
    amount: transactionData.amount,
    currency: "PLN",
    description: "",
    email: transactionData.email,
    country: "PL",
    language: "pl",
    urlReturn: `${APP_BASE_URL}/thank-you`,
    urlStatus: `${APP_BASE_URL}/api/p24/status`,
    channel: transactionData.channel,
    waitForResult: false,
    regulationAccept: transactionData.regulationAccept,
    sign,
  };

  try {
    const response = await axios.post(
      `${P24_BASE_URL}/transaction/register`,
      requestBody,
      {
        headers: getP24Headers(),
      }
    );

    return {
      token: response.data.data.token,
      sessionId,
    };
  } catch (err) {
    handleP24ApiError(err, "Błąd podczas rejestracji transakcji w Przelewy24.");
  }
}

export async function verifyTransaction(
  transactionData: Pick<
    VerifyTransactionData,
    "sessionId" | "amount" | "orderId"
  >
): Promise<{
  sessionId: string;
  status: string;
}> {
  const sign = getSign(
    "verification",
    transactionData.sessionId,
    transactionData.amount,
    transactionData.orderId
  );

  const requestBody: VerifyTransactionData = {
    merchantId: Number(P24_MERCHANT_ID),
    posId: Number(P24_MERCHANT_ID),
    sessionId: transactionData.sessionId,
    amount: transactionData.amount,
    currency: "PLN",
    orderId: transactionData.orderId,
    sign,
  };

  try {
    const response = await axios.put(
      `${P24_BASE_URL}/transaction/verify`,
      requestBody,
      {
        headers: getP24Headers(),
      }
    );

    return {
      sessionId: transactionData.sessionId,
      status: response.data.data.status,
    };
  } catch (err) {
    handleP24ApiError(err, "Błąd podczas weryfikacji transakcji w Przelewy24.");
  }
}
