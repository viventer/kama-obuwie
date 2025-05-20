import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import { EditProductDescriptionForm } from "@/components/adminPanel/products/description/EditProductDescriptionForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Uzupełnij parametry produktu`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return (
    <FormWrapper headingText="Utwórz opis produktu">
      <EditProductDescriptionForm oldDescription={data.description} />
    </FormWrapper>
  );
}
