import { ProductWithId } from "@/firebase/schemas/products";
import { getDocumentsFromAdminDB } from "@/server-actions/helpers";

export default async function CreateProductsAccessoriesPage() {
  const products = await getDocumentsFromAdminDB<ProductWithId>("products");

  return <div>page</div>;
}
