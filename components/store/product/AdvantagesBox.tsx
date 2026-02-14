import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCardIcon, PackageIcon, TruckIcon, UndoIcon } from "lucide-react";

export default function AdvantagesBox({ className }: { className?: string }) {
  return (
    <Card className={cn("flex-1 gap-0 py-5 px-6 justify-center", className)}>
      <CardContent className="px-0 py-0">
        <ul className="flex flex-col gap-3">
          <li className="flex items-center gap-2 lg:font-medium">
            <TruckIcon className="size-5 text-success" />
            Darmowa dostawa od 55 zł
          </li>
          <li className="flex items-center gap-2 lg:font-medium">
            <UndoIcon className="size-5 text-success" />
            30 dni na darmowy zwrot przez Paczkomat
          </li>
          <li className="flex items-center gap-2 lg:font-medium">
            <PackageIcon className="size-5 text-success" />
            Dostawa do Paczkomatu lub kurierem
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
