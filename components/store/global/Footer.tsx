import LinkText from "@/components/adminPanel/global/LinkText";
import React from "react";

export default function Footer() {
  const links = [
    {
      label: "kontakt",
      url: "/info/contact",
    },
    {
      label: "zwroty",
      url: "/info/returns",
    },
    {
      label: "reklamacje",
      url: "/info/complaints",
    },
    {
      label: "metody dostaw i płatności",
      url: "/info/shipping-and-payment-methods",
    },
    {
      label: "o nas",
      url: "/info/about",
    },
    {
      label: "regulamin",
      url: "/info/regulations",
    },
    {
      label: "polityka prywatności",
      url: "/info/privacy",
    },
  ];

  return (
    <footer className="bg-card px-4 py-2 border-t border-border mt-auto flex justify-center">
      <nav className="max-w-[1440px] w-full">
        <ul className="flex flex-wrap items-center gap-4">
          {links.map((link) => (
            <li key={link.url} className="text-sm">
              <LinkText href={link.url}>{link.label}</LinkText>
            </li>
          ))}
        </ul>
      </nav>
    </footer>
  );
}
