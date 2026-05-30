import { cn } from "@/lib/utils";
import { NavOption } from "./Footer";
import LinkText from "@/components/adminPanel/global/LinkText";

export default function DesktopHelpLinks({
  helpLinks,
  className,
}: {
  helpLinks: NavOption;
  className?: string;
}) {
  return (
    <article>
      <h3 className="font-medium text-lg mb-2">{helpLinks.groupLabel}</h3>
      <ul className="flex flex-col gap-2">
        {helpLinks.links.map((link) => (
          <li key={link.url}>
            <LinkText href={link.url} className="font-normal">
              {link.label}
            </LinkText>
          </li>
        ))}
      </ul>
    </article>
  );
}
