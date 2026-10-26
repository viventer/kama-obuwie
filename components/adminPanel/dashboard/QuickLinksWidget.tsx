import DashboardCard from "@/components/adminPanel/dashboard/DashboardCard";
import LinkText from "@/components/adminPanel/global/LinkText";

const LINKS: { label: string; href: string }[] = [
  {
    label: "Allegro Sales Center",
    href: "https://salescenter.allegro.com/my-sales?marketplaceLogin=kama-obuwie_pl",
  },
  {
    label: "Google Merchant Center",
    href: "https://merchants.google.com/mc/overview?a=5792137897",
  },
  {
    label: "Google Ads",
    href: "https://ads.google.com/aw/overview?ocid=8261154686&euid=1294150293&__u=5238963757&uscid=8261154686&__c=6431558414&authuser=0",
  },
  {
    label: "InPost Szybkie Zwroty",
    href: "https://panel.szybkiezwroty.pl/manager/merchants/6b5d1ad3-8bbe-4266-893b-c96ddab30418/tickets",
  },
  { label: "Przelewy24", href: "https://panel.przelewy24.pl/" },
  {
    label: "Anulowanie paragonu",
    href: "https://docs.google.com/spreadsheets/d/1_Ce82z7vPZLT4xnc0pQvMWm3_R9nzLBq_21geYD-S44/edit",
  },
];

export default function QuickLinksWidget({ className }: { className?: string }) {
  return (
    <DashboardCard title="Odnośniki" className={className}>
      <ul className="flex flex-col gap-2">
        {LINKS.map((link) => (
          <li key={link.label}>
            <LinkText href={link.href} className="text-sm font-normal">
              {link.label}
            </LinkText>
          </li>
        ))}
      </ul>
    </DashboardCard>
  );
}
