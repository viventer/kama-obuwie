import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsPostOfferDataTable from "@/components/adminPanel/products/create/CreateProductsPostOfferDataTable";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export const revalidate = 0;

export default async function CreateProductsNewPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "postOffer")
  );

  return (
    <>
      <SubpageHeading text="Wystaw oferty" />
      <CreateProductsPostOfferDataTable data={products || null} />
    </>
  );
}
