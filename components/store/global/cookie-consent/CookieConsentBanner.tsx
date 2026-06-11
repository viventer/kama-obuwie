"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Cookie } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  applyConsent,
  type ConsentCategories,
  OPEN_COOKIE_SETTINGS_EVENT,
  readConsentCookie,
  writeConsentCookie,
} from "@/lib/consent";

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    const stored = readConsentCookie();
    if (!stored) {
      setVisible(true);
    }

    const handleOpenSettings = () => {
      const current = readConsentCookie();
      setAnalytics(current?.analytics ?? false);
      setMarketing(current?.marketing ?? false);
      setShowSettings(true);
      setVisible(true);
    };

    window.addEventListener(OPEN_COOKIE_SETTINGS_EVENT, handleOpenSettings);
    return () =>
      window.removeEventListener(
        OPEN_COOKIE_SETTINGS_EVENT,
        handleOpenSettings,
      );
  }, []);

  const persist = useCallback((categories: ConsentCategories) => {
    writeConsentCookie(categories);
    applyConsent(categories);
    setVisible(false);
    setShowSettings(false);
  }, []);

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label="Zgoda na pliki cookie"
      className="fixed inset-x-0 bottom-0 z-200 flex justify-center px-3 pb-3 sm:px-4 sm:pb-4"
    >
      <div className="w-full max-w-3xl rounded-xs border bg-card text-card-foreground shadow-lg">
        <div className="p-4 sm:p-6">
          <div className="flex items-start gap-3">
            <Cookie className="mt-0.5 size-5 shrink-0 text-primary" />
            <div className="space-y-2">
              <h2 className="text-base font-semibold sm:text-lg">
                Szanujemy Twoją prywatność
              </h2>
              <p className="text-sm text-muted-foreground">
                Używamy plików cookies niezbędnych do działania sklepu oraz –
                za Twoją zgodą – plików statystycznych (Google Analytics) i
                marketingowych (Google Ads). Możesz zaakceptować wszystkie,
                odrzucić opcjonalne lub samodzielnie wybrać kategorie. Szczegóły
                znajdziesz w{" "}
                <Link
                  href="/info/privacy"
                  className="underline underline-offset-3 decoration-brand hover:decoration-transparent"
                >
                  polityce prywatności
                </Link>
                .
              </p>
            </div>
          </div>

          {showSettings ? (
            <div className="mt-4 space-y-3 border-t pt-4">
              <ConsentRow
                title="Niezbędne"
                description="Konieczne do działania sklepu (np. zawartość koszyka). Zawsze aktywne."
                checked
                disabled
              />
              <ConsentRow
                title="Statystyczne"
                description="Google Analytics – anonimowe statystyki korzystania ze strony."
                checked={analytics}
                onChange={setAnalytics}
              />
              <ConsentRow
                title="Marketingowe"
                description="Google Ads – mierzenie skuteczności reklam i remarketing."
                checked={marketing}
                onChange={setMarketing}
              />
            </div>
          ) : null}

          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
            {showSettings ? (
              <Button
                variant="important"
                className="sm:order-3"
                onClick={() => persist({ analytics, marketing })}
              >
                Zapisz wybór
              </Button>
            ) : (
              <Button
                variant="outline"
                className="sm:order-1"
                onClick={() => setShowSettings(true)}
              >
                Ustawienia
              </Button>
            )}
            <Button
              variant="outline"
              className="sm:order-2"
              onClick={() => persist({ analytics: false, marketing: false })}
            >
              Odrzuć wszystkie
            </Button>
            <Button
              variant="important"
              className="sm:order-4"
              onClick={() => persist({ analytics: true, marketing: true })}
            >
              Akceptuj wszystkie
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ConsentRow({
  title,
  description,
  checked,
  disabled,
  onChange,
}: {
  title: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start gap-3">
      <Checkbox
        checked={checked}
        disabled={disabled}
        onCheckedChange={(value) => onChange?.(value === true)}
        className="mt-0.5"
      />
      <span className="space-y-0.5">
        <span className="block text-sm font-medium">{title}</span>
        <span className="block text-xs text-muted-foreground">
          {description}
        </span>
      </span>
    </label>
  );
}
