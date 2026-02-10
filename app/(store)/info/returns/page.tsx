"use client";

import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ReturnsPage() {
  return (
    <section>
      <SubpageHeading text="Jak zwrócić produkt?" />
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

      <Button variant={"important"} className="mt-4" asChild>
        <a href="https://szybkiezwroty.pl/kama-obuwie">
          Wypełnij formularz zwrotu
        </a>
      </Button>

      <Card className="gap-2 mt-8">
        <CardHeader className="text-lg">
          <CardTitle>Adres do zwrotów</CardTitle>
          <CardDescription>
            W przypadku zwrotu metodą własną, użyj tego adresu.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <p>Anna Kamińska - "KAM-A"</p>
            <p>ul. Plac Gazaris 11</p>
            <p>
              <b>nr lokalu:</b> stoisko nr 39
            </p>
            <p>32-700 Bochnia</p>
            <p>
              <b>nr tel.:</b> 664097737
            </p>
            <p>
              <b>email:</b> kontakt.obuwie.kama@gmail.com
            </p>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-6 mt-8">
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

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h3>Czy mogę zwrócić produkt inną metodą?</h3>
          </CardHeader>
          <CardContent>
            <p>
              Tak, możesz zwrócić zamówienie dowolnym innym przewoźnikiem na
              adres podany poniżej. W takim przypadku pokrywasz koszty zwrotu
              samodzielnie. Nie przyjmujemy zwrotów nadanych za pobraniem.
            </p>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
