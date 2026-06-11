import { z } from "zod";

export const CONSENT_COOKIE_NAME = "kama_cookie_consent";
export const CONSENT_VERSION = 1;
const CONSENT_MAX_AGE_DAYS = 365;

export const OPEN_COOKIE_SETTINGS_EVENT = "kama:open-cookie-settings";

export const consentCookieSchema = z.object({
  version: z.number(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  timestamp: z.number(),
});

export type ConsentCookieValue = z.infer<typeof consentCookieSchema>;

export type ConsentCategories = {
  analytics: boolean;
  marketing: boolean;
};

export function readConsentCookie(): ConsentCookieValue | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${CONSENT_COOKIE_NAME}=`));

  if (!match) return null;

  try {
    const raw = decodeURIComponent(
      match.slice(`${CONSENT_COOKIE_NAME}=`.length),
    );
    const parsed = consentCookieSchema.safeParse(JSON.parse(raw));

    if (!parsed.success || parsed.data.version !== CONSENT_VERSION) {
      return null;
    }

    return parsed.data;
  } catch {
    return null;
  }
}

export function writeConsentCookie(
  categories: ConsentCategories,
): ConsentCookieValue {
  const value: ConsentCookieValue = {
    version: CONSENT_VERSION,
    analytics: categories.analytics,
    marketing: categories.marketing,
    timestamp: Date.now(),
  };

  const maxAge = CONSENT_MAX_AGE_DAYS * 24 * 60 * 60;
  document.cookie = `${CONSENT_COOKIE_NAME}=${encodeURIComponent(
    JSON.stringify(value),
  )}; path=/; max-age=${maxAge}; SameSite=Lax`;

  return value;
}

// Pushes a Consent Mode v2 "update" so GTM/GA4/Google Ads tags can react to the
// user's choice. Necessary signals stay granted (set in the default snippet).
export function applyConsent(categories: ConsentCategories): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  const marketing = categories.marketing ? "granted" : "denied";

  window.gtag("consent", "update", {
    analytics_storage: categories.analytics ? "granted" : "denied",
    ad_storage: marketing,
    ad_user_data: marketing,
    ad_personalization: marketing,
    personalization_storage: marketing,
  });
}
