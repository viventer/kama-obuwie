import React from "react";
import MobileFooterLinks from "./MobileFooterLinks";
import FooterDeliveryAndPaymentMethods from "./FooterDeliveryAndPaymentMethods";
import DesktopHelpLinks from "./DesktopHelpLinks";
import CompanyInfo from "./CompanyInfo";
import CookieSettingsTrigger from "./cookie-consent/CookieSettingsTrigger";

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
    <footer
      data-store-footer
      className="bg-card border-t border-border mt-auto py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
    >
      <div className="max-w-[1440px] w-[90vw] mx-auto lg:flex justify-start items-start gap-16">
        <div className="flex gap-x-8 gap-y-4 sm:gap-x-16 mb-8 lg:border-r-1 border-secondary/50 lg:pr-16 flex-col xs:flex-row">
          <nav className=" mb-3 md:mb-6 xs:border-r-1 border-secondary/50 xs:pr-8 sm:pr-16 shrink-0">
            <DesktopHelpLinks
              helpLinks={helpLinks}
              className="hidden md:flex"
            />
            <CookieSettingsTrigger className="mt-2 text-base" />
            {/* <MobileFooterLinks navOptions={navOptions} className="md:hidden" /> */}
          </nav>
          <CompanyInfo className="shrink-0 lg:pr-16" />
        </div>
        <FooterDeliveryAndPaymentMethods />
      </div>
    </footer>
  );
}
