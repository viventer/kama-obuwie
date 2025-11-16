"use client";

import { useConfirmDialog } from "@/app/providers/ConfirmDialogProvider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ReturnsPage() {
  const { showDialog } = useConfirmDialog();

  return (
    <section>
      <h2 className="text-xl font-bold mb-2">Jak zwrócić produkt?</h2>
      <ol className="list-decimal list-inside space-y-2">
        <li>Wypełnij formularz zwrotu.</li>
        <li>
          Na podany adres e‑mail otrzymasz{" "}
          <span className="font-semibold">kod nadania</span>.
        </li>
        <li>Napisz kod nadania w widocznym miejscu na paczce.</li>
        <li>
          Umieść paczkę w dowolnym automacie{" "}
          <span className="font-semibold">Paczkomat® InPost</span>.
        </li>
      </ol>

      <Button
        variant={"important"}
        className="mt-4"
        asChild
        onClick={() =>
          showDialog({
            message: "Zwroty są tymczasowo niedostępne.",
            description:
              "Zwroty poprzez sklep internetowy będziemy będą możliwe po uruchomieniu na nim sprzedaży. Obecnie przyjmujemy zamówienia tylko przez Allegro.",
            confirmText: "OK",
            onConfirm: () => {},
            hasCancelButton: false,
          })
        }
      >
        <a href="#">Wypełnij formularz zwrotu</a>
      </Button>

      <section className="mt-8 space-y-6">
        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h3>Ile kosztuje zwrot?</h3>
          </CardHeader>
          <CardContent>
            Zwrot poprzez InPost jest{" "}
            <span className="underline decoration-2 decoration-success font-bold">
              darmowy
            </span>
            .
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h3>Ile mam czasu na dokonanie zwrotu?</h3>
          </CardHeader>
          <CardContent>
            Na nadanie przesyłki zwrotnej masz aż{" "}
            <span className="font-semibold">30 dni</span> od dnia otrzymania
            zamówienia.
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h3>Jak szybko uzyskam zwrot środków?</h3>
          </CardHeader>
          <CardContent>
            W przypadku pozytywnego rozpatrzenia zwrotu, środki zazwyczaj
            zwracamy w ciągu <span className="font-semibold">24 godzin</span> od
            otrzymania przesyłki zwrotnej. Na koncie mogą pojawić się w ciągu
            kilku dni roboczych.
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
