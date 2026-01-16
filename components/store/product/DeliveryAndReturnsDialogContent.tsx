"use client";

import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import LinkText from "@/components/adminPanel/global/LinkText";

export default function DeliveryAndReturnsDialogContent() {
  const { closeDialog } = useDialogWindow();

  return (
    <section className="flex flex-col gap-4 overflow-auto">
      <article className="flex flex-col gap-2">
        <h4 className="text-lg font-bold md:text-xl">Koszt dostawy</h4>
        <div>
          <p className="font-medium">Zamówienia za min. 55 zł</p>
          <ul>
            <li className="list-disc list-inside ml-4">
              Inpost Paczkomaty 24/7:{" "}
              <span className="font-medium decoration-success decoration-2 underline">
                0 zł
              </span>
            </li>
            <li className="list-disc list-inside ml-4">
              Inpost Kurier:{" "}
              <span className="font-medium decoration-success decoration-2 underline">
                0 zł
              </span>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium">Zamówienia poniżej 55 zł</p>
          <ul>
            <li className="list-disc list-inside ml-4">
              Inpost Paczkomaty 24/7:{" "}
              <span className="font-medium">9,99 zł</span>
            </li>
            <li className="list-disc list-inside ml-4">
              Inpost Kurier: <span className="font-medium">9,99 zł</span>
            </li>
          </ul>
        </div>
        <LinkText
          href="/info/shipping-and-payment-methods"
          onClick={closeDialog}
        >
          Więcej o dostawie
        </LinkText>
      </article>
      <article className="flex flex-col gap-2">
        <h4 className="text-lg font-bold md:text-xl">Zwroty</h4>
        <div>
          <ul>
            <li className="list-disc list-inside ml-4">
              Zwrot przez Paczkomat Inpost jest{" "}
              <span className="font-medium decoration-success decoration-2 underline">
                darmowy
              </span>
            </li>
            <li className="list-disc list-inside ml-4">
              Możliwość zwrotu metodą własną
            </li>
            <li className="list-disc list-inside ml-4">
              Masz{" "}
              <span className="font-medium decoration-success decoration-2 underline">
                30 dni na zwrot
              </span>{" "}
              od daty otrzymania przesyłki
            </li>
          </ul>
        </div>
      </article>
      <LinkText href="/info/returns" onClick={closeDialog}>
        Więcej o zwrotach
      </LinkText>
    </section>
  );
}
