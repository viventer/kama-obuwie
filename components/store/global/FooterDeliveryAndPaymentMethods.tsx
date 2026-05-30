import { Button } from "@/components/ui/button";
import { BanknoteIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function FooterDeliveryAndPaymentMethods() {
  const logos = [
    "/inpost/InpostPaczkomatRect.svg",
    "/inpost/InpostKurierRect.svg",
    "/payment/p24.svg",
    "/payment/blik.png",
    "/payment/gpay.png",
    "/payment/mastercard.svg",
    "/payment/visa.webp",
  ];

  return (
    <section className="shrink">
      <h3 className="font-medium md:text-lg">Metody płatności i dostawy</h3>
      <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 items-center mb-4">
        {logos.map((logo) => (
          <Image
            key={logo}
            src={logo}
            alt=""
            height={100}
            width={100}
            className="w-12 object-contain h-fit"
          />
        ))}
        <div className="flex bg-transparent border-success border-1 px-2 py-0.5 gap-1.5 font-medium text-sm items-center rounded-xs">
          <BanknoteIcon className="text-success" />
          Płatność za pobraniem
        </div>
      </div>
      <Link href="/info/shipping-and-payment-methods">
        <Button variant="outline">
          Więcej informacji o dostawie i płatnościach
        </Button>
      </Link>
    </section>
  );
}
