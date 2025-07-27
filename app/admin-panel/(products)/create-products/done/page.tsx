import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import CreateProductsrDoneDataTable from "@/components/adminPanel/products/create/CreateProductsDoneDataTable";

export const revalidate = 0;

export default async function CreateProductsDonePage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "done")
  );

  return (
    <>
      <SubpageHeading text="Wystawione produkty" />
      <CreateProductsrDoneDataTable data={products || null} />
    </>
  );
}
