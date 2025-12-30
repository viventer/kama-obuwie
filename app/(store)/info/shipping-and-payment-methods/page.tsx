import GoogleIcon from "@/components/icons/GoogleIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BanknoteIcon,
  CreditCardIcon,
  LandmarkIcon,
  SmartphoneIcon,
} from "lucide-react";
import Image from "next/image";

export default function ShippingAndPaymentMethods() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      {/* Nagłówek strony */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">
          Dostawa i płatność
        </h2>
        <p className="text-muted-foreground text-lg">
          Sprawdź dostępne opcje dostawy i płatności w naszym sklepie
        </p>
      </div>

      {/* Sekcja dostaw */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metody dostawy</CardTitle>
          <CardDescription>
            Oferujemy szybkie i niezawodne opcje dostawy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Dostępne metody dostaw */}
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
              <Image
                src={"/inpost/InpostPaczkomatRect.svg"}
                alt="logo InPost Paczkomat"
                width={64}
                height={64}
                className="w-full"
              />
            </div>
            <div className="flex flex-col items-center text-center p-4 bg-muted rounded-lg">
              <Image
                src={"/inpost/InpostKurierRect.svg"}
                alt="logo InPost Paczkomat"
                width={64}
                height={64}
                className="w-full"
              />
            </div>
          </div>

          <Separator />

          {/* Ceny dostaw */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>Koszty dostawy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-foreground">Cena podstawowa:</span>
                  <span className="font-semibold  text-lg">9,99 zł</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-foreground">
                    Przy zakupach za min. 55 zł:
                  </span>
                  <span className="font-semibold text-success text-lg">
                    GRATIS
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informacje o wysyłce */}
          <Card className="gap-2">
            <CardHeader>
              <CardTitle>Czas dostawy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p>
                  W przypadku zamówień złożonych do godziny 13:00, paczka
                  zostanie wysłana{" "}
                  <span className="underline decoration-2 decoration-success font-bold">
                    tego samego dnia
                  </span>
                  , a dostawa nastąpi zwykle w ciągu jednego dnia roboczego.
                </p>
                <p>
                  Zamówienia złożone po godzinie 13:00 oraz w weekendy i dni
                  świąteczne będą realizowane w najbliższy dzień roboczy.
                </p>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metody płatności</CardTitle>
          <CardDescription>
            Wybierz najbardziej wygodną dla Ciebie opcję płatności
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
              <SmartphoneIcon className="text-brand size-12 mb-2" />
              <h3 className="font-semibold text-foreground">BLIK</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
              <CreditCardIcon className="text-brand size-12 mb-2" />
              <h3 className="font-semibold text-foreground">Karta płatnicza</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
              <GoogleIcon className="text-brand size-12 mb-2" />
              <h3 className="font-semibold text-foreground">Google Pay</h3>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-4 bg-muted rounded-lg">
              <LandmarkIcon className="text-brand size-12 mb-2" />
              <h3 className="font-semibold text-foreground">
                Przelew online i tradycyjny
              </h3>
            </div>
          </div>

          <Separator className="my-6" />

          <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
            <div className="flex items-center space-x-3">
              <BanknoteIcon className="size-12 text-brand" />
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  Płatność przy odbiorze
                </h3>
                <p className="text-muted-foreground">
                  Dostępna w przypadku dostawy InPost Kurier
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dodatkowe informacje */}
      <Card className="gap-2">
        <CardHeader>
          <CardTitle className="text-lg">Dodatkowe informacje</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-4 list-disc list-inside">
            {/* <li>
              Wszystkie płatności są zabezpieczone i przetwarzane przez
              zaufanych partnerów płatniczych
            </li> */}
            <li>
              Twoje dane dostawy i kontaktowe trafiają bezpośrednio do InPost,
              nie posłużą do celów marketingowych.
            </li>
            <li>
              W przypadku pytań dotyczących dostawy lub płatności, skontaktuj
              się z naszym działem obsługi klienta
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
