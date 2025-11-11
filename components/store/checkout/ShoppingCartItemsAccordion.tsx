import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import ShoppingCartItem from "../shopping-cart/ShoppingCartItem";
import { ShoppingCartItemType } from "@/firebase/schemas/shoppingCartSchemas";

export default function ShoppingCartItemsAccordion({
  cart,
}: {
  cart: ShoppingCartItemType[];
}) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value="order-summary" className="max-w-full w-md">
        <AccordionTrigger className="cursor-pointer">
          <h2 className="text-xl">
            Podsumowanie <span className="hidden 2xs:inline">zamówienia</span>
          </h2>
        </AccordionTrigger>
        <AccordionContent>
          <article className="space-y-4 max-w-xl">
            {cart.map((cartItem) => (
              <ShoppingCartItem key={cartItem.id} cartItem={cartItem} />
            ))}
          </article>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
