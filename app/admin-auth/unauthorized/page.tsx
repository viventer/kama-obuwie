import LinkText from "@/components/adminPanel/global/LinkText";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TriangleAlertIcon } from "lucide-react";

export default function Page() {
  return (
    <Card className="flex flex-col gap-2 justify-center max-w-[500px] mx-auto border-destructive bg-background w-[90%]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TriangleAlertIcon className="size-[3rem] text-destructive" />
          <h2 className="text-[2rem] font-[500]">Brak dostępu</h2>
        </CardTitle>
        <CardDescription>
          Nie masz uprawnień do żądanego zasobu. Jeśli uważasz, że to błąd -
          skontaktuj się z administratorem.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full  flex justify-end">
        <Button variant={"link"} asChild className="opacity-100">
          <LinkText href={"/"} className="text-text">
            Wróć na stronę główną
          </LinkText>
        </Button>
      </CardContent>
    </Card>
  );
}
