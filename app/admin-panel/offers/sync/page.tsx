"use client";

import { Button } from "@/components/ui/button";
import {
  getAllegroSyncStatus,
  triggerAllegroSync,
} from "@/server-actions/allegro/sync/syncOffersBackground";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<string>("idle");
  const [message, setMessage] = useState<string>("");
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchStatus = async () => {
    try {
      const syncStatus = await getAllegroSyncStatus();
      setStatus(syncStatus.status);

      if (syncStatus.status === "running") {
        setMessage(
          `🔄 Synchronizacja w toku... (rozpoczęta: ${new Date(
            syncStatus.started || ""
          ).toLocaleString("pl-PL")})`
        );
      } else if (syncStatus.status === "completed") {
        let detailsMsg = `✅ Synchronizacja zakończona (${new Date(
          syncStatus.completed || ""
        ).toLocaleString("pl-PL")})`;

        if (syncStatus.results) {
          const { AL1, AL2 } = syncStatus.results;
          detailsMsg += `\n\n📊 Szczegóły:\n`;
          detailsMsg += `• AL1: ${AL1.success ? "✅ Sukces" : "❌ Błąd"} (${
            AL1.offersCount
          } ofert)`;
          if (AL1.error) detailsMsg += `\n  Błąd: ${AL1.error}`;
          detailsMsg += `\n• AL2: ${AL2.success ? "✅ Sukces" : "❌ Błąd"} (${
            AL2.offersCount
          } ofert)`;
          if (AL2.error) detailsMsg += `\n  Błąd: ${AL2.error}`;
        }

        setMessage(detailsMsg);
      } else if (syncStatus.status === "queued") {
        setMessage(
          `⏳ Synchronizacja w kolejce... (dodana: ${new Date(
            syncStatus.queued || ""
          ).toLocaleString("pl-PL")})`
        );
      } else if (syncStatus.status === "error") {
        setMessage(`❌ Błąd synchronizacji: ${syncStatus.error}`);
      } else {
        setMessage("");
      }

      setLastUpdate(new Date().toLocaleString("pl-PL"));
    } catch (error) {
      console.error("Error fetching sync status:", error);
    }
  };

  useEffect(() => {
    fetchStatus();

    const interval = setInterval(() => {
      if (status === "running" || status === "queued") {
        fetchStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [status]);

  const handleSync = async () => {
    setIsLoading(true);
    setMessage("");

    try {
      console.log("Uruchamiam synchronizację ofert Allegro w tle...");
      const result = await triggerAllegroSync();

      setMessage(
        `✅ ${result.message} (ID zadania: ${result.jobId?.substring(0, 8)}...)`
      );
      setStatus("queued");

      setTimeout(fetchStatus, 2000);
    } catch (error) {
      console.error("Błąd podczas uruchamiania synchronizacji:", error);
      setMessage(
        `❌ Błąd: ${error instanceof Error ? error.message : "Nieznany błąd"}`
      );
      setStatus("error");
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = isLoading || status === "running" || status === "queued";

  return (
    <div className="space-y-4 p-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Synchronizacja ofert Allegro</h1>
        <p className="text-sm text-muted-foreground">
          Synchronizacja działa w tle i będzie kontynuowana nawet jeśli serwer
          się zrestartuje.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Button onClick={handleSync} disabled={isDisabled} className="w-fit">
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {status === "running" || status === "queued"
            ? "Synchronizacja w toku..."
            : "Synchronizuj oferty z Allegro"}
        </Button>

        {message && (
          <Card
            className={`px-6 border ${
              status === "error"
                ? "border-destructive"
                : status === "completed"
                  ? "border-success"
                  : status === "running" || status === "queued"
                    ? "border-accent"
                    : "border-primary"
            }`}
          >
            <p className="font-medium whitespace-pre-line">{message}</p>
            {lastUpdate && (
              <p className="text-xs mt-1 opacity-75">
                Ostatnia aktualizacja: {lastUpdate}
              </p>
            )}
          </Card>
        )}

        {(status === "running" || status === "queued") && (
          <Button
            onClick={fetchStatus}
            variant="outline"
            size="sm"
            className="w-fit"
          >
            Odśwież status
          </Button>
        )}
      </div>
    </div>
  );
}
