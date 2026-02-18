"use client";

import Image from "next/image";
import { ProductSeriesCategory } from "./ProductSeriesSection";
import { useRouter } from "next/navigation";

export default function ProductSeriesCategoriesList({
  filteredCategories,
}: {
  filteredCategories: ProductSeriesCategory[];
}) {
  const router = useRouter();

  return (
    <article className="overflow-x-auto scrollbar">
      <div className="grid grid-rows-2 grid-flow-col gap-2 pb-2 w-fit">
        {filteredCategories.map((category) => (
          <div
            key={category.id}
            className="bg-card p-4 w-[48vw] xs:w-[40vw] max-w-[250px] rounded-xs hover:bg-card/50 transition-all cursor-pointer active:bg-transparent"
            onClick={() => router.push(`/listing/${category.id}`)}
          >
            <Image
              src={category.thumbnailUrl}
              alt={category.name}
              width={400}
              height={400}
              className="p-2 w-full rounded-xs bg-white mb-4 aspect-square object-contain"
            />
            <h3 className="text-center font-medium sm:text-lg md:text-xl capitalize">
              {category.name}
            </h3>
          </div>
        ))}
      </div>
    </article>
  );
}
