import LinkText from "@/components/adminPanel/global/LinkText";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Category } from "@/firebase/schemas/productsSchemas";
import { getProductsListingData } from "@/server-actions/products/products";
import NavOptionContent from "./NavOptionContent";

const mainCategories = [
  { label: "Męskie", rootCategory: "obuwie męskie" },
  { label: "Damskie", rootCategory: "obuwie damskie" },
  { label: "Dziecięce", rootCategory: "obuwie dziecięce" },
] as const;

export default async function MainNav() {
  const categories = await getDocumentsFromAdminDB<Category>("categories");

  const categoriesByRoot =
    categories?.reduce(
      (acc, category) => {
        if (!acc[category.rootCategory]) {
          acc[category.rootCategory] = [];
        }
        acc[category.rootCategory].push(category);
        return acc;
      },
      {} as Record<string, (Category & { id: string })[]>
    ) || {};

  // Pobierz produkty dla wszystkich kategorii
  const allCategoryIds = categories?.map((category) => category.id) || [];
  const productsData =
    allCategoryIds.length > 0
      ? await getProductsListingData(allCategoryIds)
      : {};

  // Filtruj kategorie, które mają aktywne produkty
  const categoriesWithProducts = Object.keys(categoriesByRoot).reduce(
    (acc, rootCategory) => {
      const subcategories = categoriesByRoot[rootCategory].filter(
        (category) => {
          const productsInCategory = productsData[category.id] || [];
          const hasActiveProducts = productsInCategory.some(
            (product) => product.isActive
          );
          return hasActiveProducts;
        }
      );

      if (subcategories.length > 0) {
        acc[rootCategory] = subcategories;
      }
      return acc;
    },
    {} as Record<string, (Category & { id: string })[]>
  );

  return (
    <div className="w-[90%] max-w-[1440px] flex justify-start ">
      <NavigationMenu>
        <p className="hidden font-bold pr-6 sm:inline">Obuwie</p>
        <NavigationMenuList className="gap-2">
          {mainCategories.map((mainCategory) => {
            const subcategories =
              categoriesWithProducts[mainCategory.rootCategory] || [];

            // Nie wyświetlaj kategorii głównej jeśli nie ma podkategorii z produktami
            if (subcategories.length === 0) {
              return null;
            }

            return (
              <NavigationMenuItem
                key={mainCategory.rootCategory}
                className="w-full"
              >
                <NavigationMenuTrigger className="bg-primary/15 font-medium px-3">
                  {mainCategory.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background w-ful">
                  <NavOptionContent subcategories={subcategories} />
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
