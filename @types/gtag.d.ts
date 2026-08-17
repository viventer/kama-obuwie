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

interface GtagUserData {
  email: string;
  phone_number: string;
  address: {
    first_name: string;
    last_name: string;
    street?: string;
    city?: string;
    postal_code?: string;
    country: string;
  };
}

interface GtagFunction {
  (
    command: "consent",
    action: "default" | "update",
    params: GtagConsentParams,
  ): void;
  (command: "set", field: "user_data", value: GtagUserData): void;
}

interface Window {
  dataLayer: unknown[];
  gtag?: GtagFunction;
}
