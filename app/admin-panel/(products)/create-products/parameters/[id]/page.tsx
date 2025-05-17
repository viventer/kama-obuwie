import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import EditProductParametersForm from "@/components/adminPanel/products/EditProductParametersForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { getImageUrl } from "@/server-actions/images/images";
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
    <FormWrapper headingText="Uzupełnij parametry produktu">
      <EditProductParametersForm oldData={data} />
    </FormWrapper>
  );
}
