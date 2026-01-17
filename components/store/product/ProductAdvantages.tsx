"use client";

import ExpandableElement from "@/components/ui/ExpandableElement";
import { ParsedProductDescription } from "@/helpers/productInfo";

export default function ProductAdvantages({
  advantages,
}: {
  advantages: ParsedProductDescription["advantages"];
}) {
  return (
    <article>
      <h2 className="font-medium text-lg md:text-xl mb-1">Zalety produktu</h2>
      <ExpandableElement
        collapsedHeight={160}
        expandText="Pokaż wszystkie zalety"
        collapseText="Zwiń zalety"
      >
        {advantages.map((advantage, index) => (
          <p key={index} dangerouslySetInnerHTML={{ __html: advantage }} />
        ))}
      </ExpandableElement>
    </article>
  );
}
