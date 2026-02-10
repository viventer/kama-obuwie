import LinkText from "@/components/adminPanel/global/LinkText";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function RegulationsPage() {
  return (
    <section>
      <SubpageHeading text="Regulamin sklepu internetowego" />
      <p className="text-muted-foreground mb-8">
        Niniejszy regulamin określa zasady korzystania ze sklepu internetowego
        kama-obuwie, dostępnego pod adresem internetowym{" "}
        <LinkText href="/" className="text-foreground">
          kama-obuwie.pl
        </LinkText>
        , prowadzonego przez właściciela sklepu. Sklep prowadzi sprzedaż obuwia
        wyłącznie na terenie Rzeczypospolitej Polskiej.
      </p>

      <div className="space-y-6">
        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Informacje o sprzedawcy</h2>
          </CardHeader>
          <CardContent>
            <p>Anna Kamińska - "KAM-A"</p>
            <p>ul. Krzęczków 42a</p>
            <p>32-700 Bochnia</p>
            <p>NIP: 8681255945</p>
          </CardContent>
        </Card>

        {/* <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Płatności</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4">
              W sklepie dostępne są płatności realizowane za pośrednictwem
              Przelewy24. Oferujemy następujące metody płatności:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>BLIK</li>
              <li>szybki przelew online</li>
              <li>karta płatnicza (Visa, MasterCard itp.)</li>
              <li>Visa Mobile</li>
              <li>Apple Pay</li>
              <li>Google Pay</li>
              <li>płatności odroczone</li>
              <li>tradycyjny przelew bankowy</li>
            </ul>
            <p className="mb-3">
              Dodatkowo, przy wyborze dostawy kurierem InPost istnieje możliwość
              płatności przy odbiorze (za pobraniem).
            </p>
            <p>
              Pełna lista dostępnych metod płatności oraz dostawy znajduje się
              na stronie:{" "}
              <LinkText
                href="/info/shipping-and-payments"
                className="font-medium"
              >
                Informacje o płatnościach i dostawie
              </LinkText>
              .
            </p>
          </CardContent>
        </Card> */}

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Dostawa</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Sklep oferuje następujące metody dostawy:</p>
            <ul className="list-disc list-inside space-y-1 mb-4">
              <li>InPost Paczkomat 24/7</li>
              <li>InPost Kurier</li>
            </ul>
            <p className="mb-3">
              Koszt podstawowej przesyłki wynosi{" "}
              <span className="font-semibold">9,99 zł</span>. Dla zamówień o
              wartości co najmniej 55 zł dostawa jest{" "}
              <span className="font-semibold underline decoration-2 decoration-success">
                bezpłatna
              </span>
              .
            </p>
            <p>
              Szczegółowe informacje na temat kosztów i metod dostawy dostępne
              są na stronie:{" "}
              <LinkText
                href="/info/shipping-and-payments-methods"
                className="font-medium"
              >
                Informacje o płatnościach i dostawie
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Odstąpienie od umowy (zwroty)</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Klient będący konsumentem ma prawo do odstąpienia od umowy bez
              podania przyczyny w terminie 14 dni od otrzymania towaru. Sklep,
              wychodząc naprzeciw oczekiwaniom klienta, wydłuża ten okres do{" "}
              <span className="font-semibold">30 dni</span> od daty otrzymania
              zamówienia.
            </p>
            <p className="mb-3">
              Odesłanie towaru do sklepu można zrealizować{" "}
              <span className="font-semibold underline decoration-2 decoration-success">
                bezpłatnie
              </span>{" "}
              przez Paczkomaty InPost. Po otrzymaniu zwróconego towaru, sklep
              niezwłocznie dokona zwrotu środków na rachunek bankowy, z którego
              dokonano pierwotnej płatności. W przypadku płatności za pobraniem
              zwracamy pieniądze na numer konta podany we wniosku o zwrot.
            </p>
            <p>
              Szczegółowe zasady zwrotów oraz wzór formularza odstąpienia od
              umowy są dostępne na stronie:{" "}
              <LinkText href="/info/returns" className="font-medium">
                Zasady zwrotów
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Reklamacje</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Wszystkie produkty sprzedawane w sklepie kama-obuwie są objęte{" "}
              <span className="font-semibold">2-letnią odpowiedzialnością</span>{" "}
              sprzedawcy za wady (tzw. rękojmia) zgodnie z obowiązującymi
              przepisami prawa. Klient może zgłosić reklamację w ciągu 2 lat od
              daty zakupu w przypadku wystąpienia wady fizycznej lub
              jakościowej.
            </p>
            <p className="mb-3">
              Procedura składania reklamacji została opisana na stronie:{" "}
              <LinkText href="/info/complaints" className="font-medium">
                Reklamacje
              </LinkText>
              . W ramach reklamacji należy pobrać i wypełnić formularz
              reklamacyjny, dołączyć zdjęcia dokumentujące wadę oraz przesłać
              zgłoszenie mailowo na adres{" "}
              <LinkText
                href="mailto:kontakt.obuwie.kama@gmail.com"
                className="font-medium"
              >
                kontakt.obuwie.kama@gmail.com
              </LinkText>
              .
            </p>
            <p>
              Reklamacje rozpatrywane są niezwłocznie, nie później niż w ciągu{" "}
              <span className="font-semibold">14 dni</span> od daty otrzymania
              zgłoszenia lub towaru od klienta. W przypadku uznania reklamacji,
              sklep zwróci pieniądze, wymieni produkt na nowy lub naprawi
              wadliwy towar.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Ochrona danych osobowych i cookies</h2>
          </CardHeader>
          <CardContent>
            Informacje dotyczące przetwarzania danych osobowych oraz stosowania
            plików cookies zawarte są w{" "}
            <LinkText href="/info/privacy" className="font-medium">
              Polityce prywatności i cookies
            </LinkText>
            , dostępnej na osobnej stronie.
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Postanowienia końcowe</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              W sprawach nieuregulowanych niniejszym regulaminem mają
              zastosowanie przepisy Kodeksu cywilnego oraz ustawy o prawach
              konsumenta. Sklep zastrzega sobie prawo do zmian niniejszego
              regulaminu; o wszelkich zmianach zostaną Państwo poinformowani
              poprzez aktualizację treści na tej stronie.
            </p>
            <p>
              Kontakt do obsługi sklepu:{" "}
              <LinkText
                href="mailto:kontakt.obuwie.kama@gmail.com"
                className="font-medium"
              >
                kontakt.obuwie.kama@gmail.com
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
