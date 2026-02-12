import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import MainNavClient from "./MainNavClient";

export default async function MainNav() {
  const categories = await getDocumentsFromAdminDB<CategoryWithId>("categories");
  categories?.sort((a, b) => a.name.localeCompare(b.name));

  const categoriesByRoot =
    categories?.reduce(
      (acc, category) => {
        if (!acc[category.rootCategory]) {
          acc[category.rootCategory] = [];
        }
        acc[category.rootCategory].push(category);
        return acc;
      },
      {} as Record<string, CategoryWithId[]>,
    ) || {};

  return <MainNavClient categoriesByRoot={categoriesByRoot} />;
}
