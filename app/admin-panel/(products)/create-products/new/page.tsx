import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsNewDataTable from "@/components/adminPanel/products/CreateProductsNewDataTable";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function CreateProductsNewPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "new")
  );

  return (
    <>
      <SubpageHeading text="Nowe produkty" />
      {products ? (
        <CreateProductsNewDataTable data={products} />
      ) : (
        <p>Brak nowych produktów</p>
      )}
    </>
  );
}
