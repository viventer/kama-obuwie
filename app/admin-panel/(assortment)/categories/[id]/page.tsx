import CategoryEditForm from "@/components/adminPanel/assortment/categories/CategoryEditForm";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Edytuj kategorię`,
  };
}

export default async function CategoryEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<CategoryWithId>("categories", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return <CategoryEditForm oldData={data} />;
}
