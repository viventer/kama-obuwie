import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import ProductsDataTable from "@/components/adminPanel/assortment/products/ProductsDataTable";

export const revalidate = 0;

export default async function ProductsPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "done")
  );

  return (
    <>
      <SubpageHeading text="Wystawione produkty" />
      <ProductsDataTable data={products || null} />
    </>
  );
}
