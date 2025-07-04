import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CategoriesDataTable from "@/components/adminPanel/products/categories/CategoriesDataTable";
import {
  CategoryWithAllegroCategoryName,
  CategoryWithId,
} from "@/firebase/schemas/productsSchemas";
import { getAllegroCategoryById } from "@/server-actions/allegro/categories";
import { getDocumentsFromAdminDB } from "@/firebase/getters";

export default async function CategoriesPage() {
  const categories = await getDocumentsFromAdminDB<CategoryWithId>(
    "categories"
  );

  let categoriesWithAllegroCategoryName:
    | CategoryWithAllegroCategoryName[]
    | null = null;
  if (categories !== null && categories.length) {
    const promises = categories.map(async (category) => {
      const allegroCategoryName = await getAllegroCategoryById(
        category.allegroCategoryId
      );
      return {
        ...category,
        allegroCategoryName: allegroCategoryName || "błędne ID",
      };
    });

    categoriesWithAllegroCategoryName = await Promise.all(promises);
  }

  return (
    <>
      <SubpageHeading text="Kategorie produktów" />

      <CategoriesDataTable data={categoriesWithAllegroCategoryName} />
    </>
  );
}
