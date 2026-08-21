import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import GoogleIcon from "@/components/icons/GoogleIcon";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { BanknoteIcon } from "lucide-react";
import Image from "next/image";

export default function ShippingAndPaymentMethods() {
  return (
    <div className="container  space-y-8">
      <SubpageHeading text="Dostawa i płatności" />

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
          <div className="flex gap-4">
            <div className="text-center p-4 bg-muted rounded-xs w-32 md:w-48">
              <Image
                src={"/inpost/InpostPaczkomatRect.svg"}
                alt="logo InPost Paczkomat"
                width={64}
                height={64}
                className="w-full"
              />
            </div>
            <div className="text-center p-4 bg-muted rounded-xs w-32 md:w-48">
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
          <article className="max-w-md">
            <h3 className="font-bold text-lg mb-2">Koszty dostawy</h3>
            <div className="flex justify-between items-center">
              <span className="text-foreground">Cena podstawowa:</span>
              <span className="font-medium  text-lg">9,99 zł</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-foreground">
                Przy zakupach za min. 55 zł:
              </span>
              <span className="font-medium text-success text-lg">GRATIS</span>
            </div>
          </article>

          {/* Informacje o wysyłce */}
          <div>
            <h3 className="font-bold text-lg mb-2">Czas dostawy</h3>
            <p className="mb-2">
              W przypadku zamówień złożonych do godziny 13:00, paczka zostanie
              wysłana{" "}
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Metody płatności</CardTitle>
          <CardDescription>
            Wszystkie płatności online są bezpieczne i obsługiwane przez
            Przelewy24
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul>
            <li className="ml-4 flex items-center gap-2">
              <Image
                src={"/payment/p24.svg"}
                alt="logo przelewy24"
                height={50}
                width={50}
              />
              <p>Przelew online</p>
            </li>
            <li className="ml-4 flex items-center gap-2">
              <Image
                src={"/payment/blik.png"}
                alt="logo blik"
                height={50}
                width={50}
              />
              <p>BLIK</p>
            </li>
            <li className="ml-4 flex items-center gap-2">
              <Image
                src={"/payment/visa.webp"}
                alt="logo visa"
                height={30}
                width={30}
              />
              <Image
                src={"/payment/mastercard.svg"}
                alt="logo mastercard"
                height={30}
                width={30}
              />
              <p>Płatność kartą</p>
            </li>
            <li className="ml-4 flex items-center gap-2">
              <Image
                src={"/payment/gpay.png"}
                alt="logo google pay"
                height={50}
                width={50}
              />
              <p>Google Pay</p>
            </li>
            <li className="ml-4 flex items-center gap-2">
              <BanknoteIcon className="size-[30px] text-brand" />
              <p>Płatność przy odbiorze</p>
            </li>
          </ul>
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
