import { orderByProductAvailability } from "@/helpers/availability";
import type {
  ProductListingData,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { shuffleArray } from "./utils";

export const bestsellersRootCategories = [
  "obuwie damskie",
  "obuwie męskie",
  "obuwie dziecięce",
] as const;

export type BestsellersRootCategory =
  (typeof bestsellersRootCategories)[number];

export type Bestsellers = Record<BestsellersRootCategory, ProductListingData[]>;

type BestsellersCategoryWithId = {
  rootCategory: RootCategory;
  id?: string;
};

const getListingKey = (product: ProductListingData): string =>
  `${product.id}::${product.colorVariantName}`;

export const getBestsellersData = (
  productsByCategoryId: Record<string, ProductListingData[]>,
  bestsellersCategoriesWithCategoryIds: BestsellersCategoryWithId[],
): Bestsellers => {
  const allowedRootCategories = new Set<string>(bestsellersRootCategories);
  const categoryIdsByRootCategory: Partial<
    Record<BestsellersRootCategory, string[]>
  > = {};

  for (const category of bestsellersCategoriesWithCategoryIds) {
    if (!category.id) continue;
    if (!allowedRootCategories.has(category.rootCategory)) continue;
    const rootCategory = category.rootCategory as BestsellersRootCategory;
    const ids = (categoryIdsByRootCategory[rootCategory] ||= []);
    ids.push(category.id);
  }

  const bestsellersData = bestsellersRootCategories.reduce(
    (acc, rootCategory) => {
      acc[rootCategory] = [];
      return acc;
    },
    {} as Bestsellers,
  );

  for (const [rootCategory, categoryIds] of Object.entries(
    categoryIdsByRootCategory,
  ) as Array<[BestsellersRootCategory, string[]]>) {
    const picked: ProductListingData[] = [];
    const seen = new Set<string>();

    const addIfNew = (product: ProductListingData) => {
      const key = getListingKey(product);
      if (seen.has(key)) return;
      seen.add(key);
      picked.push(product);
    };

    // 1) Po 3 produkty z każdej kategorii (3 * 4 = 12)
    const sortedByCategoryId = new Map<string, ProductListingData[]>();
    for (const categoryId of categoryIds) {
      const values =
        productsByCategoryId[categoryId]?.filter(
          (product) => product.isActive,
        ) || [];
      const sorted = [...values].sort(orderByProductAvailability);
      sortedByCategoryId.set(categoryId, sorted);

      for (const product of sorted.slice(0, 3)) {
        if (picked.length >= 12) break;
        addIfNew(product);
      }
    }

    // 2) Jeśli brakuje do 12 (np. pusta kategoria), dobieramy z pozostałych produktów
    if (picked.length < 12) {
      for (const categoryId of categoryIds) {
        const sorted = sortedByCategoryId.get(categoryId) || [];
        for (const product of sorted.slice(3)) {
          if (picked.length >= 12) break;
          addIfNew(product);
        }
        if (picked.length >= 12) break;
      }
    }

    bestsellersData[rootCategory] = shuffleArray(picked.slice(0, 12));
  }

  return bestsellersData;
};
