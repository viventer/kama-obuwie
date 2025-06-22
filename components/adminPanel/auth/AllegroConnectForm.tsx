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
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Loader from "../global/Loader";

export default function AllegroConnectForm() {
  const router = useRouter();
  const { user, loading: userLoading } = useUser();
  const { showToast } = useToast();

  useEffect(() => {
    if (user?.isAllegroConnected) {
      router.replace("/admin-panel");
      showToast("Konto Allegro zostało już podłączone.");
    }
  }, [user]);

  if (userLoading) {
    return <Loader />;
  }

  return (
    <Card className="w-full max-w-[600px]">
      <CardHeader>
        <CardTitle className="text-text">Zaloguj się</CardTitle>
        <CardDescription>
          Podłączenie konta Allegro jest wymagane, aby uzyskać dostęp do funkcji
          związanych z Allegro w panelu administracyjnym.
        </CardDescription>
      </CardHeader>
      <CardContent className="my-2">
        <button
          onClick={() => {
            router.push("/api/auth/allegro");
          }}
          className="text-l border-[0.1rem] border-solid border-primary flex items-center gap-2 px-3 py-2 rounded-md hover:border-accent text-text"
        >
          Podłącz konto Allegro
        </button>
      </CardContent>
    </Card>
  );
}
