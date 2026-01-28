import React from "react";
import MobileFooterLinks from "./MobileFooterLinks";
import FooterDeliveryAndPaymentMethods from "./FooterDeliveryAndPaymentMethods";

export type NavOption = {
  groupLabel: string;
  links: {
    label: string;
    url: string;
  }[];
};

export default function Footer() {
  const navOptions: NavOption[] = [
    {
      groupLabel: "Obsługa klienta",
      links: [
        {
          label: "Kontakt",
          url: "/info/contact",
        },
        {
          label: "Zwroty",
          url: "/info/returns",
        },
        {
          label: "Reklamacje",
          url: "/info/complaints",
        },
      ],
    },
    {
      groupLabel: "Informacje o sklepie",
      links: [
        {
          label: "Metody dostaw i płatności",
          url: "/info/shipping-and-payment-methods",
        },
        {
          label: "O nas",
          url: "/info/about",
        },
      ],
    },
    {
      groupLabel: "Regulaminy",
      links: [
        {
          label: "Regulamin",
          url: "/info/regulations",
        },
        {
          label: "Polityka prywatności",
          url: "/info/privacy",
        },
      ],
    },
  ];

  return (
    <footer className="bg-card px-4 py-2 border-t border-border mt-auto">
      <nav className="max-w-[1440px] w-full mb-2">
        <MobileFooterLinks navOptions={navOptions} />
      </nav>
      <FooterDeliveryAndPaymentMethods />
    </footer>
  );
}
