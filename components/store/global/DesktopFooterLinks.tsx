import { cn } from "@/lib/utils";
import { NavOption } from "./Footer";
import LinkText from "@/components/adminPanel/global/LinkText";

export default function DesktopFooterLinks({
  navOptions,
  className,
}: {
  navOptions: NavOption[];
  className?: string;
}) {
  return (
    <div className={cn("w-full gap-8", className)}>
      {navOptions.map((option) => (
        <article
          key={option.groupLabel}
          className="border-r-1 border-secondary/50 pr-8 last:border-0 last:pr-0"
        >
          <h3 className="font-medium text-lg">{option.groupLabel}</h3>
          <ul className="flex flex-col gap-2 mt-2">
            {option.links.map((link) => (
              <li key={link.url}>
                <LinkText href={link.url} className="font-normal">
                  {link.label}
                </LinkText>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}
