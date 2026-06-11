type GtagConsentValue = "granted" | "denied";

interface GtagConsentParams {
  ad_storage?: GtagConsentValue;
  ad_user_data?: GtagConsentValue;
  ad_personalization?: GtagConsentValue;
  analytics_storage?: GtagConsentValue;
  functionality_storage?: GtagConsentValue;
  personalization_storage?: GtagConsentValue;
  security_storage?: GtagConsentValue;
  wait_for_update?: number;
}

interface Window {
  dataLayer: unknown[];
  gtag?: (
    command: "consent",
    action: "default" | "update",
    params: GtagConsentParams,
  ) => void;
}
