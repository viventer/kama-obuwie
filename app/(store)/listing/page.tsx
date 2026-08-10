import { Suspense } from "react";
import ListingSearchView, {
  CatalogListingView,
} from "@/components/store/listing/ListingSearchView";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { orderByProductAvailability } from "@/helpers/availability";
import { getCategoryDisplayName } from "@/helpers/categories";
import { getProductsListingData } from "@/server-actions/products/products";
import { isShoeRootCategory } from "@/lib/search/types";

export const revalidate = 86400; // 24h (ISR) — catalog shell; `?q=` loads client-side

export default async function ListingSearchPage() {
  const categories =
    (await getDocumentsFromAdminDB<CategoryWithId>("categories")) ?? [];
  const shoeCategories = categories.filter((c) =>
    isShoeRootCategory(c.rootCategory),
  );
  const categoryLabels = Object.fromEntries(
    shoeCategories.map((c) => [c.id, getCategoryDisplayName(c)]),
  );
  const popularCategories = shoeCategories.map((c) => ({
    id: c.id,
    label: getCategoryDisplayName(c),
  }));

  const shoeCategoryIds = shoeCategories.map((c) => c.id);
  const byCategory = await getProductsListingData(shoeCategoryIds);
  const catalogProducts = Object.values(byCategory)
    .flat()
    .filter((p) => p.isActive)
    .sort((a, b) => orderByProductAvailability(a, b));

  return (
    <Suspense
      fallback={
        <CatalogListingView
          products={catalogProducts}
          categoryLabels={categoryLabels}
          popularCategories={popularCategories}
        />
      }
    >
      <ListingSearchView
        catalogProducts={catalogProducts}
        categoryLabels={categoryLabels}
        popularCategories={popularCategories}
      />
    </Suspense>
  );
}
