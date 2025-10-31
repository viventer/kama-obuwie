import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { notFound } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import EditOfferForm from "@/components/adminPanel/offers/forms/EditOfferForm";
import { getProductBySKU } from "@/server-actions/products/products";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: "Edytuj ofertę",
  };
}

export default async function OfferEditPage(props: Props) {
  const { id } = await props.params;
  const offerResp = await getDocumentFromAdminDB<OfferWithId>("offers", id);
  const { data: oldData } = offerResp;
  if (!oldData) {
    notFound();
  }
  if (!oldData?.SKU) {
    notFound();
  }

  return (
    <FormWrapper headingText="Edytuj ofertę">
      <EditOfferForm oldData={oldData} />
    </FormWrapper>
  );
}
