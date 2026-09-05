"use client";

import Link from "next/link";
import { TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex justify-center py-16">
      <Card className="w-full max-w-lg gap-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TriangleAlert className="text-destructive" />
            Wystąpił nieoczekiwany błąd
          </CardTitle>
          <CardDescription>
            Coś poszło nie tak. Spróbuj ponownie lub skontaktuj się z nami, jeśli
            problem się powtarza.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button variant="important" onClick={reset}>
            Spróbuj ponownie
          </Button>
          <Button variant="outline" asChild>
            <Link href="/info/contact">Kontakt</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Strona główna</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
