import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsPhotosDataTable from "@/components/adminPanel/assortment/create-products/CreateProductsPhotosDataTable";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";

export const revalidate = 0;

export default async function CreateProductsPhotosPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "photos")
  );

  return (
    <>
      <SubpageHeading text="Dodaj zdjęcia" />
      <CreateProductsPhotosDataTable
        data={products || null}
        creationStage="photos"
      />
    </>
  );
}
