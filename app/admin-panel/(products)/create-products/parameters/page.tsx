import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsParametersDataTable from "@/components/adminPanel/products/create/CreateProductsParametersDataTable";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export const revalidate = 0;

export default async function CreateProductsNewPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "parameters")
  );

  return (
    <>
      <SubpageHeading text="Uzupełnij parametry" />
      <CreateProductsParametersDataTable data={products || null} />
    </>
  );
}
