import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";

import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentsFromAdminDB } from "@/firebase/getters";

export const revalidate = 180;

export default async function OrdersNewPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>(
    "products",
    (ref) => ref.where("creationStage", "==", "new")
  );

  return (
    <>
      <SubpageHeading text="Nowe zamówienia" />
    </>
  );
}
