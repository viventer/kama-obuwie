import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import ProductsDataTable from "@/components/adminPanel/assortment/products/ProductsDataTable";

export const revalidate = 0;

export default async function ProductsPage() {
  const [products, categories] = await Promise.all([
    getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
      ref.where("creationStage", "==", "done"),
    ),
    getDocumentsFromAdminDB<CategoryWithId>("categories"),
  ]);

  return (
    <>
      <SubpageHeading text="Wystawione produkty" />
      <ProductsDataTable
        data={products || null}
        categories={categories ?? []}
      />
    </>
  );
}
