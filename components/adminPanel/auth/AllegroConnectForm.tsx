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
import { useEffect, Suspense } from "react";
import Loader from "../global/Loader";
import { allegroSalesChannels } from "@/lib/constants";

function AllegroConnectContent() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const connectedAccounts = user?.connectedAccounts;
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  if (searchParams.get("error") === "incorrect_account") {
    showToast("Podłącz prawidłowe konto Allegro.", "error");
  }

  useEffect(() => {
    if (!user && !userLoading) {
      router.push("/admin-auth/login");
      return;
    }

    if (connectedAccounts?.AL1 && connectedAccounts?.AL2) {
      router.replace("/admin-panel");
      showToast("Konta Allegro zostały już podłączone.");
    }
  }, [user]);

  if (userLoading || !connectedAccounts) {
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
            user.connectedAccounts[key as keyof typeof user.connectedAccounts];
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
