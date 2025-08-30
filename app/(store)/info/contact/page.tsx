import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { MailIcon, PhoneIcon, ClockIcon } from "lucide-react";
import LinkText from "@/components/adminPanel/global/LinkText";

export default function ContactPage() {
  return (
    <div className="container mx-auto max-w-4xl space-y-8">
      {/* Nagłówek strony */}
      <div className="text-center space-y-2">
        <h2 className="text-xl font-bold text-foreground">Obsługa klienta</h2>
        <p className=" text-lg">
          Skontaktuj się z nami lub znajdź odpowiedzi na najczęściej zadawane
          pytania
        </p>
      </div>

      {/* Sekcja danych kontaktowych */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Dane kontaktowe</CardTitle>
          <CardDescription>
            Jesteśmy do Twojej dyspozycji w godzinach pracy
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Kontakt */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <MailIcon className="text-brand w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-foreground">Email</h3>
                  <LinkText href="mailto:kontakt.kama.obuwie@gmail.com">
                    kontakt.kama.obuwie@gmail.com
                  </LinkText>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <PhoneIcon className="text-brand w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-foreground">Telefon</h3>
                  <LinkText href="tel:664097737">664 097 737</LinkText>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <ClockIcon className="text-brand w-6 h-6" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Godziny pracy
                  </h3>
                  <div className=" space-y-1">
                    <p>Poniedziałek - Piątek: 8:00 - 16:30</p>
                    <p>Sobota: 8:00 - 13:30</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sekcja FAQ */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Najczęściej zadawane pytania
          </CardTitle>
          <CardDescription>
            Znajdź szybkie odpowiedzi na popularne pytania
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* FAQ Items */}
          <div className="space-y-4">
            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Jak mogę sprawdzić status zamówienia?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="">
                  Wszystkie informacje dotyczące realizacji zamówienia
                  znajdziesz na mailu.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Jak zwrócić produkt?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="">
                  Instrukcję dokonania zwrotu znajdziesz na{" "}
                  <LinkText href="/info/returns">stronie zwrotów</LinkText>.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Jak wymienić niepasujący rozmiar?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="">
                  Należy zgłosić zwrot i zamówić produkt ponownie w innym
                  rozmiarze.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Ile kosztuje dostawa?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className=" space-y-2">
                  <p>
                    W przypadku zamówień o wartości przekraczającej{" "}
                    <span className="font-semibold underline decoration-2 decoration-success">
                      55 złotych dostawa jest darmowa
                    </span>
                    .
                  </p>
                  <p>
                    Cena podstawowa to{" "}
                    <span className="font-semibold">9,99 zł</span> w przypadku
                    wszystkich metod.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Jak długo trwa dostawa?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <div className=" space-y-2">
                  <p>
                    Całkowity czas realizacji zamówienia to zwykle{" "}
                    <span className="font-semibold">24 godziny</span>.
                  </p>
                  <p>
                    Przesyłki najczęściej są doręczane kolejnego dnia roboczego.
                  </p>
                  <p>
                    Zamówienia złożone w piątek po południu lub w sobotę rano
                    zwykle wysyłamy w sobotę.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Kiedy otrzymam zwrot środków?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="">
                  Pieniądze zwracamy zazwyczaj w ciągu{" "}
                  <span className="font-semibold">24 godzin</span> od momentu
                  otrzymania zwrotu. Na koncie mogą pojawić się w ciągu kilku
                  dni roboczych.
                </p>
              </CardContent>
            </Card>

            <Card className="gap-0 bg-background">
              <CardHeader>
                <h3 className="font-semibold text-foreground">
                  Czy mogę anulować lub modyfikować zamówienie?
                </h3>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="">
                  Po złożeniu zamówienia nie ma możliwości jego modyfikacji ani
                  anulowania. Jeśli zdecydujesz, że produkt nie spełnia Twoich
                  oczekiwań - możesz go bezpłatnie zwrócić.
                </p>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
