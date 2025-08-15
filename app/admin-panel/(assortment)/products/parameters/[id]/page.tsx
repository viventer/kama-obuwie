import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import EditProductParametersForm from "@/components/adminPanel/assortment/parameters/EditProductParametersForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Edytuj parametry produktu`,
  };
}

export default async function ProductParametersEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return (
    <FormWrapper headingText="Edytuj parametry produktu">
      <EditProductParametersForm oldData={data} />
    </FormWrapper>
  );
}
