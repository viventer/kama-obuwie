import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import Link from "next/link";

export default function Page() {
  return (
    <Card className="flex flex-col gap-2 justify-center w-full max-w-[500px] mx-auto border-accent bg-background  mt-16 ">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <InfoIcon className="size-[3rem] text-accent" />
          <h2 className="text-[2rem] font-[500]">Work in progress</h2>
        </CardTitle>
        <CardDescription>
          Skorzystaj z przycisku poniżej, aby przejść do admin panelu. Ta strona
          jest w trakcie tworzenia i nie jest jeszcze dostępna.
        </CardDescription>
      </CardHeader>
      <CardContent className="w-full  flex justify-end">
        <Button variant={"link"} asChild className="opacity-100">
          <Link href={"/admin-panel"}>Otwórz admin panel</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
