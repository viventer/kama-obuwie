import HomeGrid from "@/components/store/home/HomeGrid";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import {
  RootCategory,
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getImageUrl } from "@/server-actions/files/files";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import ProductsList, {
  OfferListingData,
} from "@/components/store/home/ProductsList";

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

  // Pobierz tylko produkty z kategorii o id podanych na liście categories
  const categoryIds = categories
    .map((cat) => cat.id)
    .filter(Boolean) as string[];

  const allProducts = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("categoryId", "in", categoryIds)
  );

  // Pobierz wszystkie oferty
  const allOffers = await getDocumentsFromAdminDB<OfferWithId>("offers");

  // Funkcja pomocnicza do przekształcania produktu w ProductWithOfferData
  const transformProductToOfferData = async (
    product: ProductWithId
  ): Promise<OfferListingData | null> => {
    // Znajdź pierwszą ofertę dla tego produktu
    const offerEntry = product.offersIds
      ? Object.entries(product.offersIds)[0]
      : null;
    if (!offerEntry) return null;

    const [, offerId] = offerEntry;
    const offer = allOffers?.find((offer) => offer.id === offerId);
    if (!offer) return null;

    // Pobierz URL obrazu
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
      id: offer.id,
      brand: product?.brand || undefined,
    };
  };

  // Podziel produkty w obiekcie na poszczególne kategorie
  const offers: Record<string, OfferListingData[]> = {};

  for (const category of categories) {
    if (category.id) {
      const categoryProducts =
        allProducts?.filter((product) => product.categoryId === category.id) ||
        [];

      // Przekształć produkty na OfferListingData
      const offersListingData: OfferListingData[] = [];
      for (const product of categoryProducts) {
        const productWithOfferData = await transformProductToOfferData(product);
        if (productWithOfferData) {
          offersListingData.push(productWithOfferData);
        }
      }

      offers[category.name] = offersListingData;
    }
  }

  return (
    <>
      <HomeGrid />
      {Object.entries(offers).map(([categoryName, offersInCategory]) => (
        <ProductsList
          key={categoryName}
          offers={offersInCategory}
          categoryName={categoryName}
          displayName={
            categories.find((cat) => cat.name === categoryName)?.displayName ||
            ""
          }
        />
      ))}
    </>
  );
}
