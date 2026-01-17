import ExpandableElement from "@/components/ui/ExpandableElement";
import { ParsedProductDescription } from "@/helpers/productInfo";

export default function ProductSalesDescription({
  salesDescription,
}: {
  salesDescription: ParsedProductDescription["salesDescription"];
}) {
  return (
    <article>
      <ExpandableElement
        collapsedHeight={160}
        expandText="Rozwiń opis"
        collapseText="Zwiń opis"
      >
        <div
          dangerouslySetInnerHTML={{ __html: salesDescription! }}
          className="product-sales-description"
        ></div>
      </ExpandableElement>
    </article>
  );
}
