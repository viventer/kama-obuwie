import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  MapPinIcon,
  ClockIcon,
  ShoppingBagIcon,
  StarIcon,
  InfoIcon,
} from "lucide-react";

export default function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      {/* Nagłówek strony */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">O firmie</h2>
        <p className="text-foreground text-lg">
          Poznaj naszą historię i dowiedz się, dlaczego warto nam zaufać
        </p>
      </div>

      {/* Główna sekcja o firmie */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Nasza historia</CardTitle>
          <CardDescription>
            Ponad 13 lat doświadczenia w branży obuwniczej
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="prose prose-neutral max-w-none">
            <p className="text-foreground leading-relaxed">
              Działamy już od ponad{" "}
              <span className="font-semibold text-foreground">13 lat</span> jako
              sklep z obuwiem dla całej rodziny. Przez te wszystkie lata
              zdobyliśmy zaufanie tysięcy zadowolonych klientów, oferując
              szeroki wybór wysokiej jakości obuwia.
            </p>

            <p className="text-foreground leading-relaxed">
              Oferujemy szeroki wybór obuwia damskiego, męskiego i dziecięcego –
              od codziennego po eleganckie i sportowe modele. Stawiamy na
              sprawdzoną jakość, komfort i atrakcyjne ceny, dzięki czemu zaufały
              nam już tysiące klientów.
            </p>

            <p className="text-foreground leading-relaxed">
              Dbamy o szybką realizację zamówień oraz profesjonalną obsługę, by
              zakupy były zawsze wygodne i bezproblemowe.
            </p>
          </div>

          {/* Wyróżniki */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-8">
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-sm">
              <ClockIcon className="text-brand w-8 h-8 mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">
                13+ lat doświadczenia
              </h3>
              <p className="text-xs text-foreground">Sprawdzona jakość usług</p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-sm">
              <ShoppingBagIcon className="text-brand w-8 h-8 mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">
                Szeroki asortyment
              </h3>
              <p className="text-xs text-foreground">
                Obuwie dla całej rodziny
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-sm">
              <StarIcon className="text-brand w-8 h-8 mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">
                Zadowoleni klienci
              </h3>
              <p className="text-xs text-foreground">
                Tysiące pozytywnych opinii
              </p>
            </div>

            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-sm">
              <MapPinIcon className="text-brand w-8 h-8 mb-3" />
              <h3 className="font-semibold text-foreground text-sm mb-1">
                Sklep stacjonarny
              </h3>
              <p className="text-xs text-foreground">
                Sprawdź nasze lokalizację
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sekcja sklepu stacjonarnego */}
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
                  <h3 className="font-semibold text-foreground mb-2">Adres</h3>
                  <div className="text-foreground space-y-1">
                    <p className="font-medium">Hala Targowa Gazaris</p>
                    <p>stoisko nr 39</p>
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
                  <h3 className="font-semibold text-foreground mb-2">
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

      {/* Nasze wartości */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dlaczego warto nam zaufać?</CardTitle>
          <CardDescription>
            Poznaj nasze główne wartości i podejście do biznesu
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Sprawdzona jakość
                  </h3>
                  <p className="text-sm text-foreground">
                    Współpracujemy tylko z renomowanymi markami i dostawcami
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Darmowe, łatwe zwroty
                  </h3>
                  <p className="text-sm text-foreground">
                    30 dni na bezpłatny zwrot poprzez Paczkomat InPost
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
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
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Profesjonalna obsługa
                  </h3>
                  <p className="text-sm text-foreground">
                    Nasz zespół zawsze służy pomocą i doradztwem
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Darmowa dostawa przez InPost
                  </h3>
                  <p className="text-sm text-foreground">
                    Dostawa gratis przy zamówieniach powyżej 55 zł
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
                    Bezpieczne i szybkie metody płatności
                  </h3>
                  <p className="text-sm text-foreground">
                    Oferujemy różnorodne metody płatności, aby zakupy były
                    wygodne i bezpieczne
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 rounded-full bg-brand mt-2"></div>
                <div>
                  <h3 className="font-semibold text-foreground mb-1">
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
          <CardContent>
            <p>Anna Kamińska - "KAM-A"</p>
            <p>ul. Krzęczków 42a</p>
            <p>32-700 Bochnia</p>
            <p>NIP: 8681255945</p>
          </CardContent>
        </CardHeader>
      </Card>
    </div>
  );
}
