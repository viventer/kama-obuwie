import LinkText from "@/components/adminPanel/global/LinkText";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <section>
      <SubpageHeading text="Polityka prywatności i cookies" />
      <p className="text-muted-foreground mb-8">
        Niniejsza polityka określa zasady przetwarzania danych osobowych oraz
        wykorzystania plików cookies w sklepie internetowym Kama-Obuwie, zgodnie
        z przepisami RODO i obowiązującymi regulacjami krajowymi.
      </p>

      <div className="space-y-6">
        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Administrator danych osobowych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-2">Administratorem danych osobowych jest:</p>
            <p className="font-semibold">Anna Kamińska - "KAM-A"</p>
            <p>ul. Krzęczków 42a</p>
            <p>32-700 Bochnia</p>
            <p>NIP: 8681255945</p>
            <p className="mt-3">
              Kontakt z administratorem jest możliwy poprzez adres e-mail:{" "}
              <LinkText href="mailto:kontakt@kama-obuwie.pl">
                kontakt@kama-obuwie.pl
              </LinkText>
              . W sprawach związanych z przetwarzaniem danych można również
              wysłać korespondencję na adres siedziby wskazany powyżej.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Zakres i cel przetwarzania danych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              W sklepie przetwarzane są dane niezbędne do realizacji zamówień
              oraz obsługi klienta, takie jak:{" "}
              <span className="font-semibold">
                imię i nazwisko, adres e-mail, numer telefonu, adres dostawy
              </span>{" "}
              oraz dane niezbędne do obsługi płatności.
            </p>
            <p>
              Dane przetwarzane są w celu: realizacji umowy sprzedaży (przyjęcia
              i realizacji zamówienia), obsługi płatności, wysyłki towaru oraz
              kontaktu w sprawie zamówienia.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Podstawy prawne przetwarzania danych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Podstawy prawne przetwarzania danych osobowych stosowane przez
              administratora:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-semibold">Art. 6 ust. 1 lit. b RODO</span>{" "}
                – przetwarzanie niezbędne do wykonania umowy sprzedaży
                (realizacja zamówienia, dostawa, obsługa płatności).
              </li>
              <li>
                <span className="font-semibold">Art. 6 ust. 1 lit. c RODO</span>{" "}
                – przetwarzanie niezbędne do wypełnienia obowiązków prawnych
                ciążących na administratorze (np. przepisy podatkowe i księgowe
                dotyczące przechowywania dokumentacji).
              </li>
              <li>
                <span className="font-semibold">Art. 6 ust. 1 lit. a RODO</span>{" "}
                – przetwarzanie na podstawie dobrowolnie wyrażonej zgody (np.
                niektóre cookies lub zgoda marketingowa, jeśli zostanie
                udzielona).
              </li>
              <li>
                <span className="font-semibold">Art. 6 ust. 1 lit. f RODO</span>{" "}
                – prawnie uzasadnione interesy administratora (np. zapobieganie
                nadużyciom i oszustwom, dochodzenie roszczeń, zapewnienie
                bezpieczeństwa systemów).
              </li>
            </ul>
            <p className="mb-3">
              Administrator nie przetwarza danych szczególnych kategorii (np.
              dotyczących zdrowia, przekonań religijnych) w ramach standardowej
              działalności sklepu.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Odbiorcy danych osobowych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Dane klientów przekazywane są wyłącznie podmiotom niezbędnym do
              realizacji zamówienia, w szczególności:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-semibold">InPost</span> – dostawa
                przesyłek
              </li>
              <li>
                <span className="font-semibold">Przelewy24</span> – obsługa
                płatności
              </li>
            </ul>
            <p>
              Dane nie są sprzedawane ani wykorzystywane w innych celach bez
              wyraźnej zgody użytkownika.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Okres przechowywania danych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Dane osobowe będą przechowywane przez czas niezbędny do realizacji
              zamówienia oraz przez okres wymagany przepisami prawa (np. dla
              celów księgowych i podatkowych). Standardowo:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                dane związane z realizacją zamówienia – do momentu wygaśnięcia
                zobowiązań ze stosunku prawnego oraz do czasu przedawnienia
                roszczeń;
              </li>
              <li>
                dane przetwarzane dla celów księgowych – zgodnie z wymogami
                prawa (zazwyczaj 5 lat lub okres wskazany w przepisach
                szczegółowych).
              </li>
            </ul>
            <p>
              W przypadku zgód marketingowych (jeśli zostaną udzielone) dane
              będą przetwarzane do czasu ich wycofania.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Rejestracja konta i marketing</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Sklep{" "}
              <span className="font-semibold">
                nie udostępnia funkcji zakładania kont użytkowników
              </span>
              . Dane nie są wykorzystywane do działań marketingowych, o ile
              użytkownik nie wyrazi na to odrębnej zgody.
            </p>
            <p>
              W przypadku wyrażenia zgody użytkownik ma prawo w każdej chwili ją
              wycofać.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Google Analytics, Google Ads i inne usługi zewnętrzne</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Witryna korzysta z{" "}
              <span className="font-semibold">Google Analytics</span> w celu
              prowadzenia anonimowych statystyk odwiedzin oraz z{" "}
              <span className="font-semibold">Google Ads</span> w celu pomiaru
              skuteczności reklam i prowadzenia działań remarketingowych. Usługi
              te wykorzystują pliki cookies. Dane przekazywane do Google są
              przetwarzane zgodnie z polityką Google.
            </p>
            <p className="mb-3">
              Cookies statystyczne (Google Analytics) oraz marketingowe (Google
              Ads) są uruchamiane{" "}
              <span className="font-semibold">
                wyłącznie po wyrażeniu przez użytkownika zgody
              </span>
              . Do momentu udzielenia zgody powyższe usługi nie zapisują plików
              cookies na urządzeniu użytkownika. Stosujemy mechanizm Google
              Consent Mode v2, w którym domyślnym stanem jest brak zgody
              (denied) na cookies analityczne i marketingowe.
            </p>
            <p>
              Administrator może korzystać także z innych usług zewnętrznych
              (np. operatorów płatności, usług kurierskich). Z tymi podmiotami
              zawarte są umowy powierzenia przetwarzania danych, zapewniające
              odpowiedni poziom ochrony danych.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Prawa użytkowników</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Osobie, której dane dotyczą, przysługują prawa przewidziane w
              RODO, w tym:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>dostęp do swoich danych;</li>
              <li>sprostowanie nieprawidłowych danych;</li>
              <li>
                usunięcie danych („prawo do bycia zapomnianym") – w zakresie
                przewidzianym przez prawo;
              </li>
              <li>ograniczenie przetwarzania;</li>
              <li>przenoszenie danych;</li>
              <li>wniesienie sprzeciwu wobec przetwarzania;</li>
              <li>
                wycofanie zgody w dowolnym momencie (jeżeli przetwarzanie odbywa
                się na jej podstawie).
              </li>
            </ul>
            <p>
              W celu realizacji swoich praw użytkownik może kontaktować się z
              administratorem poprzez e-mail:{" "}
              <LinkText href="mailto:kontakt@kama-obuwie.pl">
                kontakt@kama-obuwie.pl
              </LinkText>{" "}
              lub przesyłając korespondencję na adres siedziby.
            </p>
            <p className="mt-3">
              Jeżeli użytkownik uzna, że jego prawa nie zostały uwzględnione, ma
              prawo złożyć skargę do organu nadzorczego – Prezesa Urzędu Ochrony
              Danych Osobowych (PUODO).
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Bezpieczeństwo danych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Administrator stosuje odpowiednie środki techniczne i
              organizacyjne mające na celu zabezpieczenie danych osobowych przed
              nieuprawnionym dostępem, utratą, modyfikacją lub ujawnieniem.
              Obejmują one m.in. szyfrowanie transmisji (HTTPS), kontrolę
              dostępu do systemów oraz kopie zapasowe.
            </p>
            <p>
              Dostęp do danych mają wyłącznie upoważnione osoby, a podmioty
              przetwarzające dane na zlecenie są zobowiązane do zachowania
              poufności.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Pliki cookies</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Strona wykorzystuje{" "}
              <span className="font-semibold">pliki cookies</span> w celach
              technicznych (niezbędnych do działania serwisu) oraz
              statystycznych. Cookies to małe pliki tekstowe zapisywane w
              urządzeniu użytkownika.
            </p>
            <p className="mb-3">
              Rodzaje cookies używane na stronie:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-semibold">Niezbędne</span> – konieczne do
                działania sklepu (np. utrzymanie zawartości koszyka). Nie
                wymagają zgody i są zawsze aktywne.
              </li>
              <li>
                <span className="font-semibold">Statystyczne</span> (Google
                Analytics) – służą do zbierania anonimowych informacji o
                korzystaniu ze strony. Uruchamiane wyłącznie za zgodą
                użytkownika.
              </li>
              <li>
                <span className="font-semibold">Marketingowe</span> (Google Ads)
                – służą do pomiaru skuteczności reklam i remarketingu.
                Uruchamiane wyłącznie za zgodą użytkownika.
              </li>
            </ul>
            <p className="mb-3">
              Przy pierwszej wizycie wyświetlamy baner umożliwiający wyrażenie
              lub odrzucenie zgody na poszczególne kategorie cookies. Zgodę
              można w każdej chwili zmienić lub wycofać, korzystając z odnośnika{" "}
              <span className="font-semibold">„Ustawienia cookies"</span> w
              stopce strony. Wycofanie zgody jest równie proste jak jej
              udzielenie.
            </p>
            <p>
              Użytkownik może również w każdej chwili zmienić ustawienia
              przeglądarki, by zablokować lub usunąć cookies. Należy jednak
              pamiętać, że wyłączenie niektórych plików cookies może ograniczyć
              funkcjonalność serwisu.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Zmiany w polityce prywatności</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Administrator zastrzega sobie prawo do wprowadzania zmian w
              polityce prywatności. O zmianach użytkownicy będą informowani
              poprzez zamieszczenie aktualnej wersji dokumentu na stronie. Data
              ostatniej aktualizacji znajduje się poniżej.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Postanowienia końcowe</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Niniejsza polityka obowiązuje od dnia publikacji na stronie.
            </p>
            <p className="font-semibold">
              Data ostatniej aktualizacji: 17 listopada 2025
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
