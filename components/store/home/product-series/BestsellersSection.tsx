import type { Bestsellers, BestsellersRootCategory } from "@/lib/bestsellers";
import ProductFromList from "../ProductFromList";

export default function BestsellersSection({
  bestsellersData,
  rootCategory,
}: {
  bestsellersData: Bestsellers;
  rootCategory: BestsellersRootCategory;
}) {
  return (
    <article className="max-w-full">
      <h2 className="text-xl md:text-2xl pb-4 md:pb-0">
        <span className="font-medium capitalize">Hity sezonu</span> -{" "}
        {rootCategory}
      </h2>
      <div className="overflow-x-auto scrollbar grid grid-rows-1 grid-flow-col gap-2 w-fit max-w-full pb-2 md:pt-4">
        {bestsellersData[rootCategory].map((product) => (
          <div
            key={`${product.id}-${product.colorVariantName}`}
            className="w-[40vw] max-w-[250px]"
          >
            <ProductFromList
              product={product}
              sizes="(min-width: 640px) 250px, 40vw"
            />
          </div>
        ))}
      </div>
    </article>
  );
}
