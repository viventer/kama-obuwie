import React from "react";
import MobileFooterLinks from "./MobileFooterLinks";
import FooterDeliveryAndPaymentMethods from "./FooterDeliveryAndPaymentMethods";
import DesktopHelpLinks from "./DesktopHelpLinks";
import DesktopCompanyInfo from "./DesktopCompanyInfo";

export type NavOption = {
  groupLabel: string;
  links: {
    label: string;
    url: string;
  }[];
};

export default function Footer() {
  const helpLinks: NavOption = {
    groupLabel: "Pomoc",
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
      {
        label: "Regulamin",
        url: "/info/regulations",
      },
      {
        label: "Polityka prywatności",
        url: "/info/privacy",
      },
    ],
  };

  return (
    <footer className="bg-card border-t border-border mt-auto py-2 md:py-6 ">
      <div className="max-w-[1440px] w-[90vw] mx-auto xl:flex justify-start items-start gap-16">
        <nav className=" mb-3 md:mb-6 border-r-1 border-secondary/50 pr-16 shrink-0">
          <DesktopHelpLinks helpLinks={helpLinks} className="hidden md:flex" />
          {/* <MobileFooterLinks navOptions={navOptions} className="md:hidden" /> */}
        </nav>
        <DesktopCompanyInfo className="hidden md:block border-r-1 border-secondary/50 pr-16 shrink-0" />
        <FooterDeliveryAndPaymentMethods />
      </div>
    </footer>
  );
}
