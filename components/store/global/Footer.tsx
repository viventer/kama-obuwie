import LinkText from "@/components/adminPanel/global/LinkText";
import React from "react";

export default function Footer() {
  const links = [
    {
      label: "zwroty",
      url: "/info/returns",
    },
    {
      label: "metody dostaw i płatności",
      url: "/info/shipping-and-payment-methods",
    },
    {
      label: "kontakt",
      url: "/info/contact",
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
      url: "/info/privacy-policy",
    },
  ];

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-card px-4 py-2 border-t border-border">
      <nav>
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
