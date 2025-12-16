"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/useToast";
import { useUser } from "@/hooks/useUser";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, Suspense, useState } from "react";
import Loader from "../global/Loader";
import { allegroSalesChannels } from "@/lib/constants";
import axios from "axios";

function AllegroConnectContent() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [connectedAccounts, setConnectedAccounts] = useState<{
    AL1: boolean;
    AL2: boolean;
  } | null>(null);
  const [statusLoading, setStatusLoading] = useState(true);

  if (searchParams.get("error") === "incorrect_account") {
    showToast("Podłącz prawidłowe konto Allegro.", "error");
  }

  // Sprawdź rolę użytkownika
  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/admin-auth/login");
      return;
    }

    if (user && user.role !== "ADMIN") {
      router.push("/admin-auth/allegro-connect/disconnected");
      return;
    }
  }, [user, userLoading]);

  // Pobierz status połączonych kont z Redis
  useEffect(() => {
    const fetchAllegroStatus = async () => {
      try {
        const response = await axios.get("/api/allegro/status");
        if (response.data) {
          const data = response.data;
          setConnectedAccounts(data);

          if (data.AL1 && data.AL2) {
            router.replace("/admin-panel");
            showToast("Konta Allegro zostały już podłączone.");
          }
        }
      } catch (error) {
        console.error("Error fetching Allegro status:", error);
      } finally {
        setStatusLoading(false);
      }
    };

    if (user?.role === "ADMIN") {
      fetchAllegroStatus();
    }
  }, [user]);

  if (userLoading || statusLoading || !connectedAccounts) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-[600px]">
      <CardHeader>
        <CardTitle className="text-text">Podłącz konto Allegro</CardTitle>
        <CardDescription>
          Podłączenie kont Allegro jest wymagane, aby uzyskać dostęp do funkcji
          związanych z Allegro w panelu administracyjnym.
        </CardDescription>
      </CardHeader>
      <CardContent className="my-2 flex gap-4">
        {allegroSalesChannels.map((key) => {
          const isConnected =
            connectedAccounts[key as keyof typeof connectedAccounts];
          return (
            <button
              key={key}
              onClick={() => {
                router.push(`/api/auth/allegro?account=${key}`);
              }}
              className={`text-l border-[0.1rem] border-solid border-${
                isConnected ? "success" : "primary"
              } flex items-center gap-2 px-3 py-2 rounded-md ${
                isConnected ? "" : "hover:border-accent hover:cursor-pointer"
              } ${isConnected ? "text-muted-foreground" : "text-text"}`}
              disabled={isConnected}
            >
              {isConnected ? `Konto ${key} podłączone` : `Podłącz konto ${key}`}
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

export default function AllegroConnectForm() {
  return (
    <Suspense fallback={<Loader />}>
      <AllegroConnectContent />
    </Suspense>
  );
}
