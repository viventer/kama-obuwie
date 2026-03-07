import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { getProductsListingData } from "@/server-actions/products/products";
import {
  bestsellersSectionCategories,
  homeSliderBanners,
} from "@/lib/constants";
import { orderByProductAvailability } from "@/helpers/availability";
import ShopReviewsWidget from "@/components/store/global/ShopReviewsWidget";
import AdvantagesBox from "@/components/store/product/AdvantagesBox";
import HomeSlider from "@/components/store/home/HomeSlider";
import ProductSeriesSection, {
  ProductSeriesCategory,
} from "@/components/store/home/product-series/ProductSeriesSection";
import { BestsellersRootCategory, getBestsellersData } from "@/lib/bestsellers";

export default async function Page() {
  // Pobierz kategorie z bazy danych
  const categoriesFromDB =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");

  const products = await getProductsListingData(
    categoriesFromDB!.map((category) => category.id),
    8,
  );

  const productSeriesCategories: ProductSeriesCategory[] = Object.entries(
    products,
  ).map(([categoryId, products]) => {
    const matchingCategory = categoriesFromDB?.find(
      (dbCategory) => dbCategory.id == categoryId,
    );

    const sortedProducts = products.sort((a, b) =>
      orderByProductAvailability(a, b),
    );

    return {
      name: matchingCategory!.name,
      rootCategory: matchingCategory!.rootCategory as BestsellersRootCategory,
      id: matchingCategory!.id,
      thumbnailUrl: sortedProducts[0].thumbnailUrl,
    };
  });

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

  const bestsellersCategoriesWithCategoryIds = bestsellersSectionCategories.map(
    (category) => {
      const matchingCategory = categoriesFromDB?.find(
        (dbCategory) =>
          dbCategory.name === category.name &&
          dbCategory.rootCategory === category.rootCategory,
      );

      return {
        ...category,
        id: matchingCategory?.id,
      };
    },
  );

  return (
    <div className="flex flex-col gap-16 mt-4">
      <section className="flex flex-col gap-8 border-b-1 pb-16">
        <HomeSlider banners={homeSliderBannersWithCategoryIds} />
        <div className="flex gap-8 flex-col lg:flex-row">
          <ShopReviewsWidget className="flex-2" />
          <AdvantagesBox className="bg-transparent px-0 py-0 lg:bg-card lg:px-6 lg:py-4" />
        </div>
      </section>
      <ProductSeriesSection
        categories={productSeriesCategories}
        bestsellersData={getBestsellersData(
          products,
          bestsellersCategoriesWithCategoryIds,
        )}
      />
    </div>
  );
}
