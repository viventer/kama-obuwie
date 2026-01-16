"use client";

import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import LinkText from "@/components/adminPanel/global/LinkText";
import { BanknoteIcon } from "lucide-react";
import Image from "next/image";

export default function DeliveryAndPaymentMethodsDialogContent() {
  const { closeDialog } = useDialogWindow();

  return (
    <section className="flex flex-col gap-4 overflow-auto">
      <article className="flex flex-col gap-2">
        <h4 className="text-lg font-bold md:text-xl">Metody dostawy</h4>
        <ul>
          <li className="ml-4 mb-2">
            <Image
              src={"/inpost/InpostPaczkomatPoziom.svg"}
              alt="logo inpost"
              width={200}
              height={20}
            />{" "}
            <span className="font-medium decoration-success decoration-2 underline">
              0 zł
            </span>{" "}
            (dla zamówień powyżej 55 zł)
          </li>
          <li className="ml-4">
            <Image
              src={"/inpost/InpostKurierPoziom.svg"}
              alt="logo inpost"
              width={200}
              height={20}
              className="h-[20px] w-fit"
            />{" "}
            <span className="font-medium decoration-success decoration-2 underline">
              0 zł
            </span>{" "}
            (dla zamówień powyżej 55 zł)
          </li>
        </ul>
      </article>
      <article className="flex flex-col gap-2">
        <h4 className="text-lg font-bold md:text-xl">Metody płatności</h4>
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
        <p>
          Wszystkie metody płatności online są w pełni{" "}
          <span className="font-medium decoration-success decoration-2 underline">
            bezpieczne
          </span>{" "}
          i obsługiwne przez{" "}
          <span className="font-medium decoration-success decoration-2 underline">
            Przelewy24
          </span>
          .
        </p>
      </article>
      <LinkText href="/info/shipping-and-payment-methods" onClick={closeDialog}>
        Więcej o dostawie i płatnościach
      </LinkText>
    </section>
  );
}
