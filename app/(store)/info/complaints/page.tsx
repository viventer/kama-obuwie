import LinkText from "@/components/adminPanel/global/LinkText";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function ComplaintsPage() {
  return (
    <section>
      <SubpageHeading text="Jak złożyć reklamację?" />
      <ol className="list-decimal list-inside space-y-4">
        <li>
          <strong>Pobierz formularz reklamacyjny</strong>
          <br />
          Formularz dostępny jest{" "}
          <LinkText
            href="https://drive.google.com/file/d/1FvlLTh2uHiBdff6wxFvy4kyATACqdT0A/view?usp=sharing"
            target="_blank"
          >
            tutaj
          </LinkText>
          . Wydrukuj go i wypełnij czytelnie.
        </li>
        <li>
          <strong>Przygotuj dokumentację reklamacji</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>Zrób zdjęcia uszkodzeń obuwia (pokaż wyraźnie wadę).</li>
            <li>Zeskanuj lub sfotografuj wypełniony formularz.</li>
            <li>
              Opcjonalnie dodaj dodatkowe informacje, które mogą pomóc w ocenie
              reklamacji.
            </li>
          </ul>
        </li>
        <li>
          <strong>Wyślij zgłoszenie e-mailowe</strong>
          <br />
          Prześlij zdjęcia oraz formularz na adres:{" "}
          <a href="mailto:reklamacje@kama-obuwie.pl">
            reklamacje@kama-obuwie.pl
          </a>
        </li>
        <li>
          <strong>Rozpatrzenie reklamacji</strong>
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>
              Jeśli zdjęcia i formularz wystarczą – poinformujemy Cię o decyzji
              bez konieczności odsyłania produktu.
            </li>
            <li>
              Jeśli potrzebujemy dokładniejszych oględzin, poprosimy o odesłanie
              obuwia (koszty przesyłki pokrywa sklep).
            </li>
          </ul>
        </li>
        <li>
          <strong>Decyzja i dalsze działania</strong>
          <br />
          Reklamacja zostanie rozpatrzona w ciągu maks. 14 dni od otrzymania
          produktu (lub od przesłania dokumentacji, jeśli odesłanie nie będzie
          konieczne).
          <br />
          <br />W przypadku pozytywnego rozpatrzenia reklamacji:
          <ul className="list-disc list-inside ml-4 mt-2 space-y-1">
            <li>zwrócimy pieniądze, lub</li>
            <li>dokonamy naprawy, lub</li>
            <li>wymienimy produkt na nowy.</li>
          </ul>
        </li>
      </ol>

      <Button variant={"important"} className="mt-6" asChild>
        <a
          href="https://drive.google.com/file/d/1FvlLTh2uHiBdff6wxFvy4kyATACqdT0A/view?usp=sharing"
          target="_blank"
        >
          Pobierz formularz reklamacyjny
        </a>
      </Button>

      <section className="mt-8 space-y-6">
        <h3 className="text-xl font-bold mb-4">Najczęściej zadawane pytania</h3>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Ile mam czasu na złożenie reklamacji?</h4>
          </CardHeader>
          <CardContent>
            Możesz zgłosić niezgodność towaru z umową, jeśli ujawni się ona w
            ciągu{" "}
            <span className="font-semibold">2 lat od otrzymania towaru</span>,
            zgodnie z obowiązującymi przepisami (ustawa o prawach konsumenta).
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Jak długo trwa rozpatrzenie reklamacji?</h4>
          </CardHeader>
          <CardContent>
            Reklamację rozpatrujemy w ciągu{" "}
            <span className="font-semibold">14 dni kalendarzowych</span> od
            otrzymania zgłoszenia lub produktu.
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Czy muszę odsyłać buty, żeby złożyć reklamację?</h4>
          </CardHeader>
          <CardContent>
            <span className="font-semibold">Niekoniecznie</span> – w wielu
            przypadkach wystarczą zdjęcia wady i formularz. Jeśli konieczne będą
            dokładniejsze oględziny, poprosimy o odesłanie obuwia na nasz koszt.
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Kto pokrywa koszt przesyłki reklamacyjnej?</h4>
          </CardHeader>
          <CardContent>
            Koszt odesłania reklamowanego produktu{" "}
            <span className="font-semibold underline decoration-2 decoration-success">
              zawsze pokrywa sklep
            </span>
            .
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Co mogę otrzymać w ramach reklamacji?</h4>
          </CardHeader>
          <CardContent>
            <div>W zależności od sytuacji:</div>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>zwrot pieniędzy,</li>
              <li>wymianę produktu na nowy,</li>
              <li>albo naprawę obuwia.</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Czy mogę złożyć reklamację bez paragonu?</h4>
          </CardHeader>
          <CardContent>
            <span className="font-semibold">Tak</span> – wystarczy inny dowód
            zakupu, np. potwierdzenie płatności, mail z zamówieniem lub faktura.
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>Jak otrzymam zwrot pieniędzy?</h4>
          </CardHeader>
          <CardContent>
            Zwrot środków realizujemy{" "}
            <span className="font-semibold">
              tą samą metodą, którą dokonano płatności
            </span>{" "}
            (chyba że poprosisz o inną formę).
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h4>W jakim przypadku mogę zgłosić reklamację?</h4>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="font-medium underline decoration-1 decoration-success mb-2">
                  Reklamację możesz złożyć, jeśli produkt ma wadę fizyczną lub
                  jakościową, np.:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>rozklejająca się podeszwa,</li>
                  <li>
                    pęknięcia, przetarcia materiału w krótkim czasie od zakupu,
                  </li>
                  <li>uszkodzone szwy,</li>
                  <li>wada fabryczna wpływająca na użytkowanie obuwia.</li>
                </ul>
              </div>
              <div>
                <div className="font-medium mb-2 underline decoration-1 decoration-destructive">
                  Reklamacja nie obejmuje:
                </div>
                <ul className="list-disc list-inside space-y-1">
                  <li>
                    naturalnego zużycia wynikającego z normalnego użytkowania,
                  </li>
                  <li>
                    uszkodzeń mechanicznych powstałych z winy użytkownika,
                  </li>
                  <li>nieprawidłowego czyszczenia lub pielęgnacji obuwia.</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>
    </section>
  );
}
