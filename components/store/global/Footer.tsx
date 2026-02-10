import React from "react";
import MobileFooterLinks from "./MobileFooterLinks";
import FooterDeliveryAndPaymentMethods from "./FooterDeliveryAndPaymentMethods";
import DesktopFooterLinks from "./DesktopFooterLinks";

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
          label: "O firmie",
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
    <footer className="bg-card border-t border-border mt-auto py-2 md:py-6 ">
      <div className="max-w-[1440px] w-[90vw] mx-auto xl:flex justify-between items-start">
        <nav className=" w-full mb-3 md:mb-6">
          <DesktopFooterLinks
            navOptions={navOptions}
            className="hidden md:flex"
          />
          <MobileFooterLinks navOptions={navOptions} className="md:hidden" />
        </nav>
        <FooterDeliveryAndPaymentMethods />
      </div>
    </footer>
  );
}
