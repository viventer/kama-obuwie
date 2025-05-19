import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsDescriptionDataTable from "@/components/adminPanel/products/create/CreateProductsDescriptionDataTable";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function CreateProductsNewPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "description")
  );

  return (
    <>
      <SubpageHeading text="Utwórz opis" />
      <CreateProductsDescriptionDataTable data={products || null} />
    </>
  );
}
