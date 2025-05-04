import CategoryEditForm from "@/components/adminPanel/products/CategoryEditForm";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Edytuj kategorię`,
  };
}

export default async function CategoryEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<CategoryWithId>("categories", id);
  const { data, ref } = result;
  if (!data) {
    notFound();
  }

  return <CategoryEditForm oldData={data} />;
}
