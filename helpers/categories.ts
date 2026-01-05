import { Category } from "@/firebase/schemas/productsSchemas";

export const getCategoryDisplayName = (category: Category): string => {
  if (category.rootCategory.includes("akcesoria")) return "Akcesoria";

  const nameSuffix: string = category.rootCategory.split(" ")[1];

  return `${category.name} ${nameSuffix}`;
};
