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

const mainCategories = [
  { label: "Męskie", rootCategory: "obuwie męskie" },
  { label: "Damskie", rootCategory: "obuwie damskie" },
  { label: "Dziecięce", rootCategory: "obuwie dziecięce" },
] as const;

export default async function MainNav() {
  const categories = await getDocumentsFromAdminDB<Category>("categories");

  const categoriesByRoot =
    categories?.reduce((acc, category) => {
      if (!acc[category.rootCategory]) {
        acc[category.rootCategory] = [];
      }
      acc[category.rootCategory].push(category);
      return acc;
    }, {} as Record<string, (Category & { id: string })[]>) || {};

  return (
    <div className="w-[90%] max-w-[1440px] flex justify-start ">
      <NavigationMenu>
        <p className="hidden font-bold pr-6 sm:inline">Obuwie</p>
        <NavigationMenuList className="gap-2">
          {mainCategories.map((mainCategory) => {
            const subcategories =
              categoriesByRoot[mainCategory.rootCategory] || [];

            return (
              <NavigationMenuItem
                key={mainCategory.rootCategory}
                className="w-full"
              >
                <NavigationMenuTrigger className="bg-primary/15 font-medium px-3">
                  {mainCategory.label}
                </NavigationMenuTrigger>
                <NavigationMenuContent className="bg-background w-full">
                  <div className="grid w-full max-w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
                    {subcategories.map((category) => (
                      <NavigationMenuLink key={category.id} asChild>
                        <LinkText
                          href={`/listing?categoryId=${encodeURIComponent(
                            category.id
                          )}`}
                        >
                          {category.name}
                        </LinkText>
                      </NavigationMenuLink>
                    ))}
                    {subcategories.length === 0 && (
                      <div className="col-span-2 text-center text-muted-foreground py-8">
                        Brak dostępnych kategorii
                      </div>
                    )}
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
            );
          })}
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}
