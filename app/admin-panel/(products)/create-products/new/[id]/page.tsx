import ProductCreateForm from "@/components/adminPanel/products/create/ProductCreateForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Edytuj produkt`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return <ProductCreateForm oldData={data} />;
}
