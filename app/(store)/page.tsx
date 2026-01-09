import { getDocumentsFromAdminDB } from "@/firebase/getters";
import {
  RootCategory,
  CategoryWithId,
} from "@/firebase/schemas/productsSchemas";
import ProductsList from "@/components/store/home/ProductsList";
import { getProductsListingData } from "@/server-actions/products/products";
import HomeGrid from "@/components/store/home/HomeGrid";
import { StarIcon } from "lucide-react";
import {
  categoriesFromMainPage,
  CategoryFromMainPage,
  homeGridCategories,
} from "@/lib/constants";
import { orderByProductAvailability } from "@/helpers/availability";

export default async function Page() {
  // Pobierz kategorie z bazy danych
  const categoriesFromDB =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");

  const mainPageCategories: CategoryFromMainPage[] = categoriesFromMainPage.map(
    (categoryFromMainPage) => {
      const matchingCategory = categoriesFromDB?.find(
        (dbCategory) =>
          dbCategory.name === categoryFromMainPage.name &&
          dbCategory.rootCategory === categoryFromMainPage.rootCategory
      );

      return {
        ...categoryFromMainPage,
        id: matchingCategory?.id,
      };
    }
  );

  const mainPageCategoriesIds = mainPageCategories
    .map((cat) => cat.id)
    .filter(Boolean) as string[];

  const products = await getProductsListingData(mainPageCategoriesIds);

  const homeGridCategoriesWithIds = homeGridCategories.map((category) => {
    const matchingCategory = categoriesFromDB?.find(
      (dbCategory) =>
        dbCategory.name === category.name &&
        dbCategory.rootCategory === category.rootCategory
    );

    return {
      ...category,
      id: matchingCategory?.id as string,
    };
  });

  return (
    <>
      <HomeGrid
        icon={
          <StarIcon className="min-w-8 min-h-8 lg:min-w-12 lg:min-h-12 text-brand" />
        }
        title="Elegancja na ważne okazje"
        categories={homeGridCategoriesWithIds}
      />
      <div className="flex flex-col gap-12">
        {Object.entries(products).map(([categoryId, productsInCategory]) => {
          const filteredProducts = productsInCategory
            .filter((product) => product.isActive)
            .sort((a, b) => orderByProductAvailability(a, b));

          if (filteredProducts.length < 4) {
            return null;
          }

          return (
            <ProductsList
              key={categoryId}
              products={filteredProducts}
              categoryId={categoryId}
              displayName={
                mainPageCategories.find((cat) => cat.id === categoryId)
                  ?.displayName || ""
              }
              categoryName={
                mainPageCategories.find((cat) => cat.id === categoryId)?.name ||
                ""
              }
            />
          );
        })}
      </div>
    </>
  );
}
