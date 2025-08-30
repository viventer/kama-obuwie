import LinkText from "@/components/adminPanel/global/LinkText";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">
        Polityka prywatności i cookies
      </h1>
      <p className="text-muted-foreground mb-8">
        Niniejsza polityka prywatności określa zasady przetwarzania danych
        osobowych oraz wykorzystania plików cookies w sklepie internetowym
        Kama-Obuwie, zgodnie z przepisami RODO i obowiązującym prawem.
      </p>

      <div className="space-y-6">
        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Administrator danych osobowych</h2>
          </CardHeader>
          <CardContent>
            Administratorem danych jest firma{" "}
            <span className="font-semibold">ANNA KAMIŃSKA - „KAM-A".</span>{" "}
            Kontakt z administratorem jest możliwy poprzez e-mail:{" "}
            <LinkText href="mailto:kontakt.obuwie.kama@gmail.com">
              kontakt.obuwie.kama@gmail.com
            </LinkText>
            .
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Zakres i cel przetwarzania danych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              W naszym sklepie zbieramy następujące dane:{" "}
              <span className="font-semibold">
                imię, nazwisko, adres e-mail, numer telefonu oraz adres dostawy{" "}
              </span>
              (w przypadku metody InPost Kurier) .
            </p>
            <p>
              Dane te przetwarzane są wyłącznie w celu{" "}
              <span className="font-semibold">realizacji zamówienia</span>{" "}
              (zawarcia i wykonania umowy sprzedaży) i są niezbędne do wykonania
              tej usługi. Podstawą prawną przetwarzania jest wykonanie umowy ze
              sklepem.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Odbiorcy danych osobowych</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Dane klientów przekazywane są podmiotom trzecim tylko w zakresie
              niezbędnym do realizacji zamówienia.
            </p>
            <p className="mb-3">
              Odbiorcami tych danych są wybrane firmy świadczące usługi
              logistyczne i płatnicze:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>
                <span className="font-semibold">InPost</span> (odpowiedzialny za
                dostawę zamówienia)
              </li>
              <li>
                <span className="font-semibold">Przelewy24</span> (operator
                płatności)
              </li>
            </ul>
            <p>
              Dane nie są udostępniane żadnym innym podmiotom ani wykorzystywane
              w innych celach.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Rejestracja konta i marketing</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Sklep <span className="font-semibold">nie umożliwia</span>{" "}
              zakładania kont użytkowników. Dane osobowe klientów nie są również
              przetwarzane w celach marketingowych.
            </p>
            <p>
              Nie wysyłamy newsletterów ani ofert handlowych bez zgody, ani nie
              profilujemy zachowań klientów w celach marketingowych.
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Google Analytics</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Sklep wykorzystuje usługę{" "}
              <span className="font-semibold">Google Analytics</span> do
              zbierania anonimowych danych statystycznych o ruchu na stronie.
              Google Analytics używa własnych plików cookie do raportowania
              interakcji użytkowników.
            </p>
            <p>
              Użytkownik może wyłączyć śledzenie przez Google Analytics (np.
              usuwając lub blokując pliki cookie) w ustawieniach przeglądarki,
              co jednak spowoduje, że dane statystyczne nie będą zbierane.
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
              RODO, m.in.:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-3">
              <li>dostęp do swoich danych</li>
              <li>sprostowanie nieprawidłowych danych</li>
              <li>usunięcie danych („prawo do bycia zapomnianym")</li>
              <li>ograniczenie przetwarzania</li>
              <li>przenoszenie danych</li>
              <li>wniesienie sprzeciwu wobec przetwarzania danych</li>
            </ul>
            <p>
              Użytkownik może także wycofać zgodę na przetwarzanie danych (jeśli
              przetwarzanie odbywa się na tej podstawie) oraz złożyć skargę do
              organu nadzorczego –{" "}
              <span className="font-semibold">
                Prezesa Urzędu Ochrony Danych Osobowych (PUODO)
              </span>
              .
            </p>
          </CardContent>
        </Card>

        <Card className="gap-0">
          <CardHeader className="font-bold text-lg">
            <h2>Pliki cookies</h2>
          </CardHeader>
          <CardContent>
            <p className="mb-3">
              Strona internetowa korzysta z{" "}
              <span className="font-semibold">plików cookies</span> (tzw.
              ciasteczek) w celach statystycznych i technicznych. Pliki te
              umożliwiają m.in. analizę ruchu na stronie (usługa Google
              Analytics) oraz zapewniają prawidłowe działanie podstawowych
              funkcji serwisu.
            </p>
            <p className="mb-3">
              Google Analytics wykorzystuje pliki cookie do zbierania
              anonimowych danych o zachowaniu użytkowników.
            </p>
            <p>
              Użytkownik może w każdej chwili zmienić ustawienia przeglądarki w
              celu usunięcia lub zablokowania plików cookies. Należy jednak
              pamiętać, że{" "}
              <span className="decoration-2 underline decoration-destructive font-semibold">
                wyłączenie cookies może ograniczyć funkcjonalność serwisu
              </span>{" "}
              (np. uniemożliwić poprawne działanie koszyka).
            </p>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
