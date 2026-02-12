import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { Category } from "@/firebase/schemas/productsSchemas";
import NavOptionContent from "./NavOptionContent";

const mainCategories = [
  { label: "Męskie", rootCategory: "obuwie męskie" },
  { label: "Damskie", rootCategory: "obuwie damskie" },
  { label: "Dziecięce", rootCategory: "obuwie dziecięce" },
] as const;

export default async function MainNav() {
  const categories = await getDocumentsFromAdminDB<Category>("categories");
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
      {} as Record<string, (Category & { id: string })[]>,
    ) || {};

  return (
    <div className="w-[100%] max-w-[1440px] flex justify-start ">
      <NavigationMenu className="justify-center ">
        <p className="hidden font-bold pr-6 sm:inline">Obuwie</p>
        <NavigationMenuList className="2xs:gap-2 w-full  gap-0 2xs:w-[90%]   2xs:justify-between">
          {mainCategories.map((mainCategory) => {
            const subcategories =
              categoriesByRoot[mainCategory.rootCategory] || [];

            // Nie wyświetlaj kategorii głównej jeśli nie ma podkategorii z produktami
            if (subcategories.length === 0) {
              return null;
            }

            return (
              <NavigationMenuItem
                key={mainCategory.rootCategory}
                className="w-full"
              >
                <NavigationMenuTrigger className="rounded-xs font-medium px-3 capitalize text-base">
                  {mainCategory.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background !max-w-[100svw] !w-[100svw] bottom-0 relative max-h-fit !h-[calc(100svh-160px)] overflow-auto scrollbar sm:!max-w-fit">
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
