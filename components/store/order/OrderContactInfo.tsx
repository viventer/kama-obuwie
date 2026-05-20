import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import LinkText from "@/components/adminPanel/global/LinkText";
import { CardDescription } from "@/components/ui/card";
import { MailQuestionIcon } from "lucide-react";

export default function OrderContactInfo() {
  return (
    <Card className="gap-2 max-w-xl">
      <CardHeader className="mb-0">
        <CardTitle className="font-medium text-xl flex gap-2 items-center">
          <MailQuestionIcon className="text-brand" />
          Masz jakieś pytania?
        </CardTitle>
        <CardDescription className="mb-2">
          Poniżej znajdziesz dane kontaktowe. Chętnie pomożemy!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p>
          E-mail:{" "}
          <LinkText href="mailto:kontakt@kama-obuwie.pl">
            kontakt@kama-obuwie.pl
          </LinkText>
        </p>
        <p className="mb-2">
          Nr telefonu:{" "}
          <LinkText href="tel:+48664097737">+48 664 097 737</LinkText>
        </p>
        <section>
          <b>Godziny pracy</b>
          <p>Pon - Pt: 8:00 - 16:30</p>
          <p>Sobota: 8:00 - 13:30</p>
        </section>
      </CardContent>
    </Card>
  );
}
