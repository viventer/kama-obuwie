import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import EditOfferForm from "@/components/adminPanel/offers/EditOfferForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Wystaw ofertę`,
  };
}

export default async function CreateProductsPostOfferPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return (
    <FormWrapper headingText="Wystaw ofertę">
      <EditOfferForm oldData={data} />
    </FormWrapper>
  );
}
