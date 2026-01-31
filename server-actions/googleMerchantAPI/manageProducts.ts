"use server";

import { MerchantCenterFootwearProduct } from "@/firebase/schemas/merchantCenter";
import { getMerchantCenterProductId } from "@/helpers/merchantCenter";
import { google } from "googleapis";

import type { content_v2 } from "googleapis";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing env var: ${name}`);
  return value;
}

function createGoogleMerchantServiceAccountAuth() {
  const clientEmail = getRequiredEnv("GOOGLE_MERCHANT_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("GOOGLE_MERCHANT_PRIVATE_KEY").replace(
    /\\n/g,
    "\n",
  );

  return new google.auth.JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/content"],
  });
}

export async function insertGoogleMerchantProduct(
  product: MerchantCenterFootwearProduct,
) {
  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const content = google.content({ version: "v2", auth });

  const id = getMerchantCenterProductId({
    channel: product.channel,
    contentLanguage: product.contentLanguage,
    targetCountry: product.targetCountry,
    offerId: product.offerId,
  });

  const requestBody: content_v2.Schema$Product = {
    ...product,
    id,
  };

  return content.products.insert({
    merchantId,
    requestBody,
  });
}

export async function updateGoogleMerchantProductAvailability(
  product: MerchantCenterFootwearProduct,
  availability: MerchantCenterFootwearProduct["availability"],
) {
  const merchantId = getRequiredEnv("GOOGLE_MERCHANT_ID");
  const auth = createGoogleMerchantServiceAccountAuth();
  const content = google.content({ version: "v2", auth });

  const id = getMerchantCenterProductId({
    channel: product.channel,
    contentLanguage: product.contentLanguage,
    targetCountry: product.targetCountry,
    offerId: product.offerId,
  });

  const requestBody: content_v2.Schema$ProductsCustomBatchRequest = {
    entries: [
      {
        batchId: 1,
        merchantId,
        method: "patch",
        productId: id,
        product: {
          availability,
        },
      },
    ],
  };

  return content.products.custombatch({ requestBody });
}
