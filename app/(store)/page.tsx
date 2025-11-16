import HomeGrid from "@/components/store/home/HomeGrid";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import {
  RootCategory,
  CategoryWithId,
} from "@/firebase/schemas/productsSchemas";
import ProductsList from "@/components/store/home/ProductsList";
import { getProductsListingData } from "@/server-actions/products/products";

type CategoryFromMainPage = {
  name: string;
  rootCategory: RootCategory;
  id?: string;
  displayName: string;
};

export default async function Page() {
  const categoriesFromMainPage: CategoryFromMainPage[] = [
    {
      name: "trampki",
      rootCategory: "obuwie dziecięce",
      displayName: "Trampki Dziecięce",
    },
    {
      name: "czółenka",
      rootCategory: "obuwie damskie",
      displayName: "Czółenka Damskie",
    },
    {
      name: "sportowe",
      rootCategory: "obuwie dziecięce",
      displayName: "Sportowe Dziecięce",
    },
    {
      name: "halówki",
      rootCategory: "obuwie męskie",
      displayName: "Halówki Męskie",
    },
    {
      name: "klapki",
      rootCategory: "obuwie damskie",
      displayName: "Klapki Damskie",
    },
    {
      name: "trampki",
      rootCategory: "obuwie męskie",
      displayName: "Trampki Męskie",
    },
    {
      name: "klapki",
      rootCategory: "obuwie dziecięce",
      displayName: "Klapki Dziecięce",
    },
    {
      name: "trekkingowe",
      rootCategory: "obuwie męskie",
      displayName: "Trekkingowe Męskie",
    },
  ];

  // Pobierz kategorie z bazy danych
  const categoriesFromDB = await getDocumentsFromAdminDB<CategoryWithId>(
    "categories"
  );

  const categories: CategoryFromMainPage[] = categoriesFromMainPage.map(
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

  const categoryIds = categories
    .map((cat) => cat.id)
    .filter(Boolean) as string[];

  const products = await getProductsListingData(categoryIds);

  return (
    <>
      {/* <HomeGrid /> */}
      <div className="flex flex-col gap-12">
        {Object.entries(products).map(([categoryId, productsInCategory]) => (
          <ProductsList
            key={categoryId}
            products={productsInCategory}
            categoryId={categoryId}
            displayName={
              categories.find((cat) => cat.id === categoryId)?.displayName || ""
            }
          />
        ))}
      </div>
    </>
  );
}
