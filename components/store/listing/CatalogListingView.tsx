import type { ReactNode } from "react";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CategoryProductsListing from "@/components/store/listing/CategoryProductsListing";
import EmptyListingState, {
  type PopularCategoryLink,
} from "@/components/store/listing/EmptyListingState";
import { ProductListingData } from "@/firebase/schemas/productsSchemas";

export default function CatalogListingView({
  products,
  categoryLabels,
  popularCategories,
  heading = "Wszystkie produkty",
  headingNode,
  defaultSortLabel = "Domyślne",
}: {
  products: ProductListingData[];
  categoryLabels: Record<string, string>;
  popularCategories: PopularCategoryLink[];
  heading?: string;
  headingNode?: ReactNode;
  defaultSortLabel?: string;
}) {
  if (products.length === 0) {
    return (
      <EmptyListingState
        heading={heading}
        headingNode={headingNode}
        message="Brak aktywnych produktów."
        popularCategories={popularCategories}
      />
    );
  }

  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 mt-4">
      {headingNode ?? <SubpageHeading text={heading} />}
      <CategoryProductsListing
        products={products}
        enableCategoryFilter
        categoryLabels={categoryLabels}
        defaultSortLabel={defaultSortLabel}
      />
    </div>
  );
}
