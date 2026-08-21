import LinkText from "@/components/adminPanel/global/LinkText";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { companyData } from "@/lib/constants";

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
            <p className="font-medium">{companyData.name}</p>
            <p>{companyData.street}</p>
            <p>
              {companyData.postalCode} {companyData.city}
            </p>
            <p>NIP: {companyData.nip}</p>
            <p>REGON: {companyData.regon}</p>
            <p className="mt-3">
              Kontakt z administratorem jest możliwy poprzez adres e-mail:{" "}
              <LinkText href={`mailto:${companyData.email}`}>
                {companyData.email}
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
              <span className="font-medium">
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
                <span className="font-medium">Art. 6 ust. 1 lit. b RODO</span> –
                przetwarzanie niezbędne do wykonania umowy sprzedaży (realizacja
                zamówienia, dostawa, obsługa płatności).
              </li>
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. c RODO</span> –
                przetwarzanie niezbędne do wypełnienia obowiązków prawnych
                ciążących na administratorze (np. przepisy podatkowe i księgowe
                dotyczące przechowywania dokumentacji).
              </li>
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. a RODO</span> –
                przetwarzanie na podstawie dobrowolnie wyrażonej zgody (np.
                niektóre cookies lub zgoda marketingowa, jeśli zostanie
                udzielona).
              </li>
              <li>
                <span className="font-medium">Art. 6 ust. 1 lit. f RODO</span> –
                prawnie uzasadnione interesy administratora (np. zapobieganie
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
                <span className="font-medium">InPost</span> – dostawa przesyłek
              </li>
              <li>
                <span className="font-medium">Przelewy24</span> (PayPro S.A.) –
                obsługa płatności
              </li>
              <li>
                <span className="font-medium">Google</span> (Google Ireland
                Limited / Google LLC) – statystyki (Google Analytics) oraz
                reklama i pomiar konwersji (Google Ads), wyłącznie po wyrażeniu
                zgody na odpowiednie pliki cookies
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
              <span className="font-medium">
                nie udostępnia funkcji zakładania kont użytkowników
              </span>
              .
            </p>
            <p className="mb-3">
              Działania marketingowe z wykorzystaniem plików cookies i narzędzi
              Google (Google Ads – śledzenie konwersji oraz remarketing)
              prowadzone są{" "}
              <span className="font-medium">
                wyłącznie po wyrażeniu przez użytkownika zgody
              </span>{" "}
              za pośrednictwem banera zgód (Consent Mode v2). Szczegóły opisano
              w sekcji „Google Analytics, Google Ads i inne usługi zewnętrzne"
              poniżej.
            </p>
            <p>
              Zgodę można w każdej chwili wycofać poprzez odnośnik „Ustawienia
              cookies" w stopce strony, bez wpływu na zgodność z prawem
              przetwarzania dokonanego przed jej wycofaniem.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Google Analytics, Google Ads i inne usługi zewnętrzne</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Witryna korzysta z usług dostarczanych przez{" "}
              <span className="font-medium">Google Ireland Limited</span> (oraz
              Google LLC):
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-medium">Google Analytics</span> – do
                prowadzenia statystyk korzystania ze strony. Dane mają charakter
                pseudonimowy i zbiorczy (identyfikatory cookies, adres IP,
                zdarzenia) i nie służą identyfikacji konkretnej osoby przez
                Administratora.
              </li>
              <li>
                <span className="font-medium">Google Ads</span> – do{" "}
                <span className="font-medium">
                  pomiaru konwersji (śledzenie konwersji)
                </span>{" "}
                oraz <span className="font-medium">remarketingu</span>, czyli
                wyświetlania reklam dopasowanych do wcześniejszych odwiedzin w
                Sklepie.
              </li>
            </ul>
            <p className="mb-3">
              Korzystanie z Google Ads wiąże się z{" "}
              <span className="font-medium">profilowaniem</span> w celach
              marketingowych (dopasowanie reklam). Profilowanie to{" "}
              <span className="font-medium">
                nie wywołuje wobec użytkownika skutków prawnych ani nie wpływa w
                istotny sposób na jego sytuację
              </span>{" "}
              w rozumieniu art. 22 RODO. Podstawą prawną tych działań jest zgoda
              użytkownika (art. 6 ust. 1 lit. a RODO).
            </p>
            <p className="mb-3">
              Cookies statystyczne (Google Analytics) oraz marketingowe (Google
              Ads) są uruchamiane{" "}
              <span className="font-medium">
                wyłącznie po wyrażeniu przez użytkownika zgody
              </span>
              . Do momentu udzielenia zgody usługi te nie zapisują plików
              cookies na urządzeniu użytkownika. Stosujemy mechanizm{" "}
              <span className="font-medium">Google Consent Mode v2</span>, w
              którym domyślnym stanem jest brak zgody (denied) na cookies
              analityczne i marketingowe.
            </p>
            <p className="mb-3">
              W związku z korzystaniem z usług Google dane (w tym dane zbierane
              przez cookies) mogą być{" "}
              <span className="font-medium">
                przekazywane do państw trzecich, w tym do USA
              </span>
              . Google deklaruje stosowanie odpowiednich zabezpieczeń, w
              szczególności certyfikacji w ramach{" "}
              <span className="font-medium">EU‑US Data Privacy Framework</span>{" "}
              oraz standardowych klauzul umownych (SCC) zatwierdzonych przez
              Komisję Europejską.
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
              <span className="font-medium">pliki cookies</span> w celach
              technicznych (niezbędnych do działania serwisu) oraz
              statystycznych. Cookies to małe pliki tekstowe zapisywane w
              urządzeniu użytkownika.
            </p>
            <p className="mb-3">Rodzaje cookies używane na stronie:</p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-medium">Niezbędne</span> – konieczne do
                działania sklepu (np. utrzymanie zawartości koszyka). Nie
                wymagają zgody i są zawsze aktywne.
              </li>
              <li>
                <span className="font-medium">Statystyczne</span> (Google
                Analytics) – służą do zbierania pseudonimowych, zbiorczych
                informacji o korzystaniu ze strony. Uruchamiane wyłącznie za
                zgodą użytkownika.
              </li>
              <li>
                <span className="font-medium">Marketingowe</span> (Google Ads) –
                służą do pomiaru konwersji oraz remarketingu (dopasowania
                reklam). Uruchamiane wyłącznie za zgodą użytkownika.
              </li>
            </ul>
            <p className="mb-3">
              Przy pierwszej wizycie wyświetlamy baner umożliwiający wyrażenie
              lub odrzucenie zgody na poszczególne kategorie cookies. Zgodę
              można w każdej chwili zmienić lub wycofać, korzystając z odnośnika{" "}
              <span className="font-medium">„Ustawienia cookies"</span> w stopce
              strony. Wycofanie zgody jest równie proste jak jej udzielenie.
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
            <p className="font-medium">
              Data ostatniej aktualizacji: 11 czerwca 2026
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
