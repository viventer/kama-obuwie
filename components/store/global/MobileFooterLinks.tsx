import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavOption } from "./Footer";
import LinkText from "@/components/adminPanel/global/LinkText";
import { cn } from "@/lib/utils";

export default function MobileFooterLinks({
  navOptions,
  className,
}: {
  navOptions: NavOption[];
  className?: string;
}) {
  return (
    <div className={cn("w-full", className)}>
      {navOptions.map((option) => (
        <Accordion
          type="single"
          collapsible
          key={option.groupLabel}
          className="w-full"
        >
          <AccordionItem value={option.groupLabel} className="w-full">
            <AccordionTrigger className="py-2">
              {option.groupLabel}
            </AccordionTrigger>
            <AccordionContent>
              <ul className="flex flex-col gap-2">
                {option.links.map((link) => (
                  <li key={link.url} className="text-sm">
                    <LinkText href={link.url} className="font-normal">
                      {link.label}
                    </LinkText>
                  </li>
                ))}
              </ul>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      ))}
    </div>
  );
}
