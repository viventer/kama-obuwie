import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { MapPinIcon, ClockIcon, InfoIcon, CopyrightIcon } from "lucide-react";
import { companyData } from "@/lib/constants";

export default function AboutPage() {
  return (
    <div className="container space-y-8">
      {/* Nagłówek strony */}
      <SubpageHeading text="Informacje o firmie" />

      {/* Główna sekcja o firmie */}
      <Card className=" gap-2">
        <CardHeader>
          <CardTitle className="text-lg">Nasza historia</CardTitle>
          <CardDescription>
            Ponad 13 lat doświadczenia w branży obuwniczej
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-text">
            Od ponad 13 lat prowadzimy sklep z obuwiem dla całej rodziny,
            zdobywając zaufanie tysięcy klientów. Oferujemy szeroki wybór butów
            damskich, męskich i dziecięcych – codziennych, eleganckich i
            sportowych. Stawiamy na jakość, komfort i atrakcyjne ceny oraz
            zapewniamy szybką realizację zamówień i profesjonalną obsługę.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <InfoIcon className="text-brand" />
            <h2>Dane firmy</h2>
          </CardTitle>
          <CardDescription>
            Informacje prawne o firmie. Podany adres <b>nie</b> służy do
            zwrotów. Adres do zwrotów znajdziesz{" "}
            <a href="/info/returns" className="underline hover:text-brand">
              tutaj
            </a>
            .
          </CardDescription>
          <CardContent className="px-0">
            <p>{companyData.name}</p>
            <p>{companyData.street}</p>
            <p>
              {companyData.postalCode} {companyData.city}
            </p>
            <p>NIP: {companyData.nip}</p>
            <p>REGON: {companyData.regon}</p>
          </CardContent>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CopyrightIcon className="text-brand" />
            <h2>Prawa do znaków towarowych</h2>
          </CardTitle>
          <CardContent className="px-0">
            <p>
              {" "}
              Wszystkie nazwy marek, znaki towarowe i nazwy produktów są
              własnością ich odpowiednich właścicieli. Nasz sklep nie jest
              oficjalnym przedstawicielem ani autoryzowanym dystrybutorem tych
              marek, o ile nie wskazano inaczej. Oferujemy oryginalne produkty
              pochodzące z legalnej dystrybucji.
            </p>
          </CardContent>
        </CardHeader>
      </Card>

      {/* Nasze wartości */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dlaczego warto nam zaufać?</CardTitle>
          <CardDescription>
            Dowiedz się co wyróżnia nas na tle konkurencji
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Sprawdzona jakość
                  </h3>
                  <p className="text-sm text-foreground">
                    Współpracujemy tylko z renomowanymi markami i dostawcami
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Darmowe, łatwe zwroty
                  </h3>
                  <p className="text-sm text-foreground">
                    30 dni na bezpłatny zwrot poprzez Paczkomat InPost
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Szybka dostawa
                  </h3>
                  <p className="text-sm text-foreground">
                    Zamówienia złożone do godziny 13:00 otrzymasz zwykle
                    kolejnego dnia roboczego
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Profesjonalna obsługa
                  </h3>
                  <p className="text-sm text-foreground">
                    Nasz zespół zawsze służy pomocą i doradztwem
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Darmowa dostawa przez InPost
                  </h3>
                  <p className="text-sm text-foreground">
                    Dostawa gratis przy zamówieniach powyżej 55 zł
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Bezpieczne i szybkie metody płatności
                  </h3>
                  <p className="text-sm text-foreground">
                    Metody płatności online są realizowane przez Przelewy24.
                    Istnieje również możliwość płatności przy odbiorze.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="size-2 rounded-full bg-brand mt-2 shrink-0"></div>
                <div>
                  <h3 className="font-medium text-foreground mb-1">
                    Długoletnie doświadczenie
                  </h3>
                  <p className="text-sm text-foreground">
                    Ponad 13 lat na rynku to gwarancja niezawodności
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sklep stacjonarny</CardTitle>
          <CardDescription>
            Odwiedź nas osobiście w naszej lokalizacji
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Adres */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPinIcon className="text-brand w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">Adres</h3>
                  <div className="text-foreground space-y-1">
                    <p className="font-medium">Hala Targowa Gazaris</p>
                    <p>pl. Gazaris 10, box 39</p>
                    <p>32-700 Bochnia</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Godziny otwarcia */}
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <ClockIcon className="text-brand w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium text-foreground mb-2">
                    Godziny otwarcia
                  </h3>
                  <div className="text-foreground space-y-1">
                    <p>
                      Poniedziałek - Piątek:{" "}
                      <span className="font-medium">8:00 - 16:30</span>
                    </p>
                    <p>
                      Sobota: <span className="font-medium">8:00 - 13:30</span>
                    </p>
                    <p>
                      Niedziela: <span className="font-medium">nieczynne</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
