import HomeGrid from "@/components/store/home/HomeGrid";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import {
  RootCategory,
  CategoryWithId,
  ProductWithId,
  ProductListingData,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import ProductsList from "@/components/store/home/ProductsList";

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

  const allProducts = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("categoryId", "in", categoryIds)
  );

  const allOffers = await getDocumentsFromAdminDB<OfferWithId>("offers");

  const transformProductToProductListingData = async (
    product: ProductWithId
  ): Promise<ProductListingData | null> => {
    const offerEntry = product.offersIds
      ? Object.entries(product.offersIds)[0]
      : null;
    if (!offerEntry) return null;

    const [, offerId] = offerEntry;
    const offer = allOffers?.find((offer) => offer.id === offerId);
    if (!offer) return null;

    let thumbnailUrl = "";
    if (offer.thumbnail) {
      if (isValidUrl(offer.thumbnail)) {
        thumbnailUrl = offer.thumbnail;
      } else {
        const imageUrl = await getImageUrl(offer.thumbnail);
        thumbnailUrl = imageUrl || "";
      }
    }

    return {
      thumbnailUrl,
      price: offer.sellingPrices.DTC || "0",
      id: product.id,
      brand: product?.brand || undefined,
    };
  };

  const products: Record<string, ProductListingData[]> = {};

  for (const category of categories) {
    if (category.id) {
      const categoryProducts =
        allProducts?.filter((product) => product.categoryId === category.id) ||
        [];

      const productsListingData: ProductListingData[] = [];
      for (const product of categoryProducts) {
        const productListingData = await transformProductToProductListingData(
          product
        );
        if (productListingData) {
          productsListingData.push(productListingData);
        }
      }

      if (productsListingData.length < 4) continue;
      products[category.id] = productsListingData;
    }
  }

  return (
    <>
      <HomeGrid />
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
