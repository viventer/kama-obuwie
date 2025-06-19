"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function AllegroConnectForm() {
  const router = useRouter();

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
            router.push("/api/auth/allegro/connect-account");
          }}
          className="text-l border-[0.1rem] border-solid border-primary flex items-center gap-2 px-3 py-2 rounded-md hover:border-accent text-text"
        >
          Podłącz konto Allegro
        </button>
      </CardContent>
    </Card>
  );
}
