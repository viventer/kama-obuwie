import Link from "next/link";
import type { ReactNode } from "react";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";

export type PopularCategoryLink = {
  id: string;
  label: string;
};

export default function EmptyListingState({
  heading,
  headingNode,
  message,
  popularCategories,
}: {
  heading?: string;
  headingNode?: ReactNode;
  message: string;
  popularCategories: PopularCategoryLink[];
}) {
  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 mt-4">
      {headingNode ?? (heading ? <SubpageHeading text={heading} /> : null)}
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      {popularCategories.length > 0 && (
        <div>
          <p className="font-medium mb-2">Popularne kategorie</p>
          <ul className="flex flex-wrap gap-2">
            {popularCategories.slice(0, 8).map((category) => (
              <li key={category.id}>
                <Link
                  href={`/listing/${category.id}`}
                  className="inline-flex rounded-xs bg-foreground/10 px-3 py-1.5 text-sm hover:bg-primary/20"
                >
                  {category.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
