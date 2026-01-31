import { MerchantCenterFootwearProduct } from "@/firebase/schemas/merchantCenter";

export function getMerchantCenterProductId({
  channel,
  contentLanguage,
  targetCountry,
  offerId,
}: {
  channel: MerchantCenterFootwearProduct["channel"];
  contentLanguage: MerchantCenterFootwearProduct["contentLanguage"];
  targetCountry: MerchantCenterFootwearProduct["targetCountry"];
  offerId: MerchantCenterFootwearProduct["offerId"];
}): string {
  return `${channel}:${contentLanguage}:${targetCountry}:${offerId}`;
}

export function getMerchantCenterItemGroupId({
  brand,
  model,
}: {
  brand?: string;
  model: string;
}): MerchantCenterFootwearProduct["itemGroupId"] {
  if (brand) {
    return `${brand}-${model}`;
  }
  return model;
}
