import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { CreditCardIcon, PackageIcon, TruckIcon, UndoIcon } from "lucide-react";

export default function AdvantagesBox({
  price,
  className,
}: {
  price: number;
  className?: string;
}) {
  return (
    <Card className={cn("flex-1 gap-0 py-4 justify-center", className)}>
      <CardContent>
        <ul className="flex flex-col gap-2">
          <li className="flex items-center gap-2 font-medium">
            <TruckIcon className="size-5 text-success" />
            Darmowa dostawa od 55 zł
          </li>
          <li className="flex items-center gap-2 font-medium">
            <UndoIcon className="size-5 text-success" />
            30 dni na darmowy zwrot przez Paczkomat
          </li>
          <li className="flex items-center gap-2 font-medium">
            <PackageIcon className="size-5 text-success" />
            Dostawa do Paczkomatu lub kurierem
          </li>
          <li className="flex items-center gap-2 font-medium">
            <CreditCardIcon className="size-5 text-success" />
            Płatność online lub przy odbiorze
          </li>
        </ul>
      </CardContent>
    </Card>
  );
}
