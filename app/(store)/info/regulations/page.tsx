import LinkText from "@/components/adminPanel/global/LinkText";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { companyData, returnsAddress } from "@/lib/constants";

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
        , w tym zasady zawierania umów sprzedaży, prawa i obowiązki stron oraz
        tryb postępowania reklamacyjnego i odstąpienia od umowy. Sklep prowadzi
        sprzedaż obuwia na terenie Rzeczypospolitej Polskiej.
      </p>

      <div className="space-y-6">
        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>1. Informacje o sprzedawcy</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Właścicielem sklepu internetowego oraz sprzedawcą jest osoba
              fizyczna prowadząca działalność gospodarczą wpisaną do Centralnej
              Ewidencji i Informacji o Działalności Gospodarczej (CEIDG),
              prowadzonej przez ministra właściwego do spraw gospodarki:
            </p>
            <p>{companyData.name}</p>
            <p>{companyData.street}</p>
            <p>
              {companyData.postalCode} {companyData.city}
            </p>
            <p>NIP: {companyData.nip}</p>
            <p>REGON: {companyData.regon}</p>
            <p className="mt-3">
              Adres do korespondencji i zwrotów: {returnsAddress.line1},{" "}
              {returnsAddress.line2}, {returnsAddress.postalCode}{" "}
              {returnsAddress.city}.
            </p>
            <p className="mt-3">
              Kontakt:{" "}
              <LinkText href={`mailto:${companyData.email}`}>
                {companyData.email}
              </LinkText>
              , tel.{" "}
              <LinkText href={companyData.phoneHref}>
                {companyData.phone}
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>2. Definicje</h2>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1">
              <li>
                <span className="font-semibold">Sprzedawca</span> – podmiot
                wskazany w punkcie 1 powyżej.
              </li>
              <li>
                <span className="font-semibold">Sklep</span> – sklep
                internetowy dostępny pod adresem kama-obuwie.pl.
              </li>
              <li>
                <span className="font-semibold">Klient</span> – osoba fizyczna,
                osoba prawna lub jednostka organizacyjna dokonująca zakupów w
                Sklepie.
              </li>
              <li>
                <span className="font-semibold">Konsument</span> – osoba
                fizyczna dokonująca ze Sprzedawcą czynności prawnej
                niezwiązanej bezpośrednio z jej działalnością gospodarczą lub
                zawodową.
              </li>
              <li>
                <span className="font-semibold">
                  Przedsiębiorca na prawach konsumenta
                </span>{" "}
                – osoba fizyczna zawierająca umowę bezpośrednio związaną z jej
                działalnością gospodarczą, gdy umowa ta nie ma dla niej
                charakteru zawodowego; w zakresie odstąpienia od umowy oraz
                odpowiedzialności za zgodność towaru z umową przysługują jej
                uprawnienia jak Konsumentowi.
              </li>
              <li>
                <span className="font-semibold">Umowa sprzedaży</span> – umowa
                zawierana na odległość pomiędzy Klientem a Sprzedawcą za
                pośrednictwem Sklepu.
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>3. Składanie zamówień i zawarcie umowy</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Zamówienia można składać przez stronę Sklepu 24 godziny na dobę.
              Do złożenia zamówienia nie jest wymagane założenie konta – Sklep
              nie udostępnia funkcji rejestracji konta użytkownika.
            </p>
            <p className="mb-3">
              Złożenie zamówienia następuje poprzez dodanie produktów do
              koszyka, podanie danych niezbędnych do realizacji i dostawy oraz
              potwierdzenie zamówienia przyciskiem oznaczonym jako zamówienie z
              obowiązkiem zapłaty. Umowa sprzedaży zostaje zawarta z chwilą
              potwierdzenia przyjęcia zamówienia przez Sprzedawcę, przesłanego
              na adres e-mail podany przez Klienta.
            </p>
            <p>
              Informacje prezentowane w Sklepie stanowią zaproszenie do
              zawarcia umowy w rozumieniu art. 71 Kodeksu cywilnego, a nie
              ofertę.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>4. Ceny i płatności</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Wszystkie ceny podane w Sklepie są cenami brutto (zawierają
              podatek VAT) i wyrażone są w złotych polskich (PLN). Cena wiążąca
              dla Klienta jest ceną wskazaną w podsumowaniu zamówienia w chwili
              jego złożenia.
            </p>
            <p className="mb-3">
              Płatności online obsługiwane są przez operatora{" "}
              <span className="font-semibold">Przelewy24</span> (PayPro S.A.).
              Dostępne metody płatności (m.in. szybki przelew, BLIK, karta
              płatnicza, Google Pay) oraz płatność przy odbiorze opisane są na
              stronie:{" "}
              <LinkText
                href="/info/shipping-and-payment-methods"
                className="font-medium"
              >
                Dostawa i płatności
              </LinkText>
              .
            </p>
            <p>
              Do każdego zamówienia wystawiany jest dowód zakupu (paragon lub –
              na życzenie Klienta – faktura).
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>5. Dostawa</h2>
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
              Szczegółowe informacje na temat kosztów, metod i czasu dostawy
              dostępne są na stronie:{" "}
              <LinkText
                href="/info/shipping-and-payment-methods"
                className="font-medium"
              >
                Dostawa i płatności
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>6. Prawo odstąpienia od umowy (zwroty)</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Konsument oraz Przedsiębiorca na prawach konsumenta, który zawarł
              umowę na odległość, może w terminie{" "}
              <span className="font-semibold">14 dni</span> odstąpić od niej bez
              podania przyczyny i bez ponoszenia kosztów, z wyjątkiem kosztów
              określonych w przepisach. Sprzedawca, wychodząc naprzeciw
              oczekiwaniom Klientów, wydłuża ten termin do{" "}
              <span className="font-semibold">30 dni</span> od dnia objęcia
              towaru w posiadanie.
            </p>
            <p className="mb-3">
              Zwroty obsługujemy przez usługę{" "}
              <span className="font-semibold">InPost Szybkie Zwroty</span> –
              najwygodniej skorzystać z formularza zwrotu dostępnego na stronie{" "}
              <LinkText href="/info/returns" className="font-medium">
                Zasady zwrotów
              </LinkText>
              , gdzie krok po kroku opisany jest cały proces. Niezależnie od
              tego Klient może odstąpić od umowy w drodze dowolnego
              jednoznacznego oświadczenia, np. wysłanego pocztą elektroniczną na
              adres{" "}
              <LinkText href={`mailto:${companyData.email}`}>
                {companyData.email}
              </LinkText>
              . Do zachowania terminu wystarczy wysłanie zgłoszenia lub
              oświadczenia przed jego upływem.
            </p>
            <p className="mb-3">
              Towar należy odesłać niezwłocznie, nie później niż w terminie 14
              dni od dnia odstąpienia. Odesłanie towaru przez Paczkomaty InPost
              jest{" "}
              <span className="font-semibold underline decoration-2 decoration-success">
                bezpłatne
              </span>
              . W przypadku wyboru innego sposobu zwrotu Klient ponosi
              bezpośrednie koszty odesłania towaru.
            </p>
            <p className="mb-3">
              Sprzedawca niezwłocznie, nie później niż w terminie 14 dni od dnia
              otrzymania oświadczenia o odstąpieniu, zwróci Klientowi wszystkie
              otrzymane płatności, w tym koszty dostawy (z wyjątkiem dodatkowych
              kosztów wynikających z wybranego przez Klienta sposobu dostawy
              innego niż najtańszy oferowany przez Sklep). Zwrot następuje tą
              samą metodą płatności, której użył Klient, chyba że Klient wyraźnie
              zgodził się na inne rozwiązanie. Sprzedawca może wstrzymać się ze
              zwrotem płatności do chwili otrzymania towaru lub dostarczenia
              dowodu jego odesłania, w zależności od tego, które zdarzenie
              nastąpi wcześniej.
            </p>
            <p>
              Prawo odstąpienia nie przysługuje m.in. w odniesieniu do umów, w
              których przedmiotem świadczenia jest rzecz wyprodukowana według
              specyfikacji Konsumenta lub służąca zaspokojeniu jego
              zindywidualizowanych potrzeb, a także w pozostałych przypadkach
              wskazanych w art. 38 ustawy o prawach konsumenta.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>7. Jak dokonać zwrotu (InPost Szybkie Zwroty)</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Zwroty realizowane są za pośrednictwem usługi{" "}
              <span className="font-semibold">InPost Szybkie Zwroty</span>. Aby
              zwrócić produkt:
            </p>
            <ol className="list-decimal list-inside space-y-1 mb-3">
              <li>wypełnij formularz zwrotu udostępniony przez Sprzedawcę,</li>
              <li>otrzymasz na e-mail kod nadania przesyłki,</li>
              <li>
                nadaj paczkę w dowolnym Paczkomacie InPost (zwrot jest dla
                Klienta bezpłatny).
              </li>
            </ol>
            <p>
              Szczegółowa instrukcja, formularz oraz adres do zwrotów metodą
              własną znajdują się na stronie:{" "}
              <LinkText href="/info/returns" className="font-medium">
                Zasady zwrotów
              </LinkText>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>8. Reklamacje (zgodność towaru z umową)</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Sprzedawca ma obowiązek dostarczenia towaru zgodnego z umową. W
              odniesieniu do Konsumentów oraz Przedsiębiorców na prawach
              konsumenta zasady odpowiedzialności reguluje{" "}
              <span className="font-semibold">
                ustawa o prawach konsumenta
              </span>{" "}
              (rozdział o odpowiedzialności za zgodność towaru z umową,
              obowiązujący od 1 stycznia 2023 r.). Sprzedawca odpowiada za brak
              zgodności towaru z umową istniejący w chwili dostarczenia i
              ujawniony w ciągu{" "}
              <span className="font-semibold">2 lat</span> od tej chwili.
            </p>
            <p className="mb-3">
              W razie braku zgodności towaru z umową Klient może żądać w
              pierwszej kolejności{" "}
              <span className="font-semibold">naprawy lub wymiany</span> towaru.
              Jeżeli naprawa lub wymiana są niemożliwe, nadmiernie kosztowne
              albo Sprzedawca ich nie dokona w rozsądnym czasie, Klient może
              złożyć oświadczenie o{" "}
              <span className="font-semibold">obniżeniu ceny</span> albo – gdy
              brak zgodności jest istotny – o{" "}
              <span className="font-semibold">odstąpieniu od umowy</span>.
            </p>
            <p className="mb-3">
              Reklamację należy zgłosić na adres{" "}
              <LinkText href="mailto:reklamacje@kama-obuwie.pl">
                reklamacje@kama-obuwie.pl
              </LinkText>
              . Procedura, w tym formularz reklamacyjny, opisana jest na
              stronie:{" "}
              <LinkText href="/info/complaints" className="font-medium">
                Reklamacje
              </LinkText>
              . Sprzedawca ustosunkuje się do reklamacji niezwłocznie, nie
              później niż w terminie{" "}
              <span className="font-semibold">14 dni</span> od jej otrzymania.
            </p>
            <p>
              W przypadku Klientów niebędących Konsumentami ani Przedsiębiorcami
              na prawach konsumenta (sprzedaż B2B) zastosowanie mają przepisy o
              rękojmi zawarte w Kodeksie cywilnym, przy czym odpowiedzialność
              Sprzedawcy z tytułu rękojmi wobec takich podmiotów zostaje
              wyłączona w zakresie dopuszczalnym przez prawo.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>9. Pozasądowe rozwiązywanie sporów</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Konsument ma możliwość skorzystania z pozasądowych sposobów
              rozpatrywania reklamacji i dochodzenia roszczeń. W szczególności
              może:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                zwrócić się do stałego polubownego sądu konsumenckiego lub do
                Wojewódzkiego Inspektoratu Inspekcji Handlowej z wnioskiem o
                rozstrzygnięcie sporu;
              </li>
              <li>
                skorzystać z bezpłatnej pomocy miejskiego lub powiatowego
                rzecznika konsumentów;
              </li>
              <li>
                uzyskać informacje na stronie Urzędu Ochrony Konkurencji i
                Konsumentów (UOKiK):{" "}
                <LinkText href="https://www.uokik.gov.pl" target="_blank">
                  uokik.gov.pl
                </LinkText>
                .
              </li>
            </ul>
            <p>
              Skorzystanie z pozasądowych sposobów rozpatrywania reklamacji i
              dochodzenia roszczeń ma charakter dobrowolny.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>10. Prawa do znaków towarowych</h2>
          </CardHeader>
          <CardContent>
            <p>
              Wszystkie nazwy marek, znaki towarowe i nazwy produktów są
              własnością ich odpowiednich właścicieli. Nasz sklep nie jest
              oficjalnym przedstawicielem ani autoryzowanym dystrybutorem tych
              marek, o ile nie wskazano inaczej. Oferujemy oryginalne produkty
              pochodzące z legalnej dystrybucji.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>11. Ochrona danych osobowych i cookies</h2>
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
            <h2>12. Postanowienia końcowe</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              W sprawach nieuregulowanych niniejszym regulaminem mają
              zastosowanie przepisy Kodeksu cywilnego, ustawy o prawach
              konsumenta oraz innych właściwych przepisów prawa polskiego.
              Postanowienia regulaminu nie wyłączają ani nie ograniczają praw
              Konsumentów wynikających z bezwzględnie obowiązujących przepisów
              prawa.
            </p>
            <p className="mb-3">
              Sprzedawca zastrzega sobie prawo do zmian niniejszego regulaminu z
              ważnych przyczyn; do zamówień złożonych przed zmianą stosuje się
              regulamin w brzmieniu obowiązującym w chwili złożenia zamówienia.
              O wszelkich zmianach Klienci zostaną poinformowani poprzez
              aktualizację treści na tej stronie.
            </p>
            <p className="mb-3">
              Kontakt do obsługi sklepu:{" "}
              <LinkText href={`mailto:${companyData.email}`}>
                {companyData.email}
              </LinkText>
              .
            </p>
            <p className="font-semibold">
              Regulamin obowiązuje od dnia 11 czerwca 2026 r.
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
