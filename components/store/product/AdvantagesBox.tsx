import { CreditCardIcon, PackageIcon, TruckIcon, UndoIcon } from "lucide-react";

export default function AdvantagesBox({ price }: { price: number }) {
  return (
    <article>
      <ul className="flex flex-col gap-2 border-secondary border-1 px-4 py-3 rounded-sm w-fit">
        <li className="flex items-center gap-2 font-medium">
          <TruckIcon className="size-5 text-success" />
          {price > 55 ? "Darmowa dostawa" : "Darmowa dostawa od 55 zł"}
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
    </article>
  );
}
