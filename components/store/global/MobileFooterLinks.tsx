import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { NavOption } from "./Footer";
import LinkText from "@/components/adminPanel/global/LinkText";

export default function MobileFooterLinks({
  navOptions,
}: {
  navOptions: NavOption[];
}) {
  return (
    <div className="w-full flex flex-col justify-center">
      {navOptions.map((option) => (
        <Accordion
          type="single"
          collapsible
          key={option.groupLabel}
          className="flex justify-center w-full"
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
