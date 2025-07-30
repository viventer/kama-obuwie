import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import CreateLabelForm from "@/components/adminPanel/orders/forms/CreateLabelForm";
import OrderDataWidget from "@/components/adminPanel/orders/OrderDataWidget";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { AllegroSalesChannel } from "@/lib/constants";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Utwórz etykietę`,
  };
}

export default async function CreateLabelPage(props: Props) {
  const { id } = await props.params;
  const { data } = await getDocumentFromAdminDB<OrderWithId>("orders", id);

  if (!data || !data.delivery || !data.allegroId) {
    return notFound();
  }

  return (
    <FormWrapper headingText="Utwórz etykietę">
      <OrderDataWidget data={data as OrderWithId} />
      <CreateLabelForm
        salesChannel={data.salesChannel as AllegroSalesChannel}
        allegroOrderId={data.allegroId}
        orderDeliveryData={data.delivery}
      />
    </FormWrapper>
  );
}
