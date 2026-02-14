import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import ProductsList from "@/components/store/home/ProductsList";
import { getProductsListingData } from "@/server-actions/products/products";
import {
  categoriesFromMainPage,
  CategoryFromMainPage,
  homeSliderBanners,
} from "@/lib/constants";
import { orderByProductAvailability } from "@/helpers/availability";
import ShopReviewsWidget from "@/components/store/global/ShopReviewsWidget";
import AdvantagesBox from "@/components/store/product/AdvantagesBox";
import HomeSlider from "@/components/store/home/HomeSlider";

export default async function Page() {
  // Pobierz kategorie z bazy danych
  const categoriesFromDB =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");

  const mainPageCategories: CategoryFromMainPage[] = categoriesFromMainPage.map(
    (categoryFromMainPage) => {
      const matchingCategory = categoriesFromDB?.find(
        (dbCategory) =>
          dbCategory.name === categoryFromMainPage.name &&
          dbCategory.rootCategory === categoryFromMainPage.rootCategory,
      );

      return {
        ...categoryFromMainPage,
        id: matchingCategory?.id,
      };
    },
  );

  const mainPageCategoriesIds = mainPageCategories
    .map((cat) => cat.id)
    .filter(Boolean) as string[];

  const products = await getProductsListingData(mainPageCategoriesIds, 12);

  const homeSliderBannersWithCategoryIds = homeSliderBanners.map((banner) => {
    const matchingCategory = categoriesFromDB?.find(
      (dbCategory) =>
        dbCategory.name === banner.destination.categoryName &&
        dbCategory.rootCategory === banner.destination.rootCategory,
    );

    return {
      ...banner,
      destination: {
        ...banner.destination,
        categoryId: matchingCategory?.id,
      },
    };
  });

  return (
    <div className="flex flex-col gap-12 mt-8 md:mt-12">
      <section className="flex flex-col gap-8">
        <HomeSlider banners={homeSliderBannersWithCategoryIds} />
        <div className="flex gap-8 flex-col lg:flex-row">
          <ShopReviewsWidget className="flex-2" />
          <AdvantagesBox className="bg-transparent px-0 py-0 lg:bg-card lg:px-6 lg:py-4" />
        </div>
      </section>
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
    </div>
  );
}
