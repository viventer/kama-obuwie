import ExpandableElement from "@/components/ui/ExpandableElement";
import { ParsedProductDescription } from "@/helpers/productInfo";

export default function ProductSalesDescription({
  salesDescription,
}: {
  salesDescription: ParsedProductDescription["salesDescription"];
}) {
  return (
    <article>
      <h2 className="font-medium text-lg md:text-xl mb-1">Opis produktu</h2>
      <ExpandableElement
        collapsedHeight={64}
        expandText="Pokaż więcej"
        collapseText="Zwiń opis"
      >
        <div dangerouslySetInnerHTML={{ __html: salesDescription! }}></div>
      </ExpandableElement>
    </article>
  );
}
