"use server";

import { getRequiredEnv } from "@/helpers/env";
import { createGoogleMerchantServiceAccountAuth } from "@/helpers/merchantCenter";
import { google } from "googleapis";

export async function registerGcpWithMerchant() {
  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantApi = google.merchantapi("accounts_v1");

  try {
    const res = await merchantApi.accounts.developerRegistration.registerGcp({
      auth,
      name: `accounts/${merchantId}/developerRegistration`,
      requestBody: {
        developerEmail: "studio.codebucket@gmail.com",
      },
    });
    console.log("Project successfully registered:", res.data);
    return res.data;
  } catch (err: any) {
    console.error(
      "Failed to register GCP project:",
      err.response?.data || err.message,
    );
    throw err;
  }
}

export async function getExistingGcpRegistration() {
  const auth = createGoogleMerchantServiceAccountAuth();
  const merchantApi = google.merchantapi("accounts_v1");

  const res =
    await merchantApi.accounts.developerRegistration.getAccountForGcpRegistration(
      {
        auth,
      },
    );
  console.log("Existing registration:", res.data);
  return res.data;
}
