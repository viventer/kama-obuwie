import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import CreateLabelForm from "@/components/adminPanel/orders/forms/CreateLabelForm";
import RequestPickupForm from "@/components/adminPanel/orders/forms/RequestPickupForm";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { getPickupProposals } from "@/server-actions/allegro/shipmentManagement";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Zamów podjazd`,
  };
}

export default async function RequestPickupPage(props: Props) {
  const { orderId } = await props.params;
  const searchParams = await props.searchParams;
  const shipmentId = searchParams.shipmentId as string;

  const { data } = await getDocumentFromAdminDB<OrderWithId>("orders", orderId);

  if (!data) {
    return notFound();
  }

  const pickupProposals = await getPickupProposals(
    shipmentId,
    data.salesChannel as "AL1" | "AL2"
  );

  if (!pickupProposals || pickupProposals.length === 0) {
    return notFound();
  }

  return (
    <FormWrapper headingText="Zamów podjazd">
      <RequestPickupForm
        shipmentData={data.shipment}
        pickupProposals={pickupProposals}
        shipmentId={shipmentId}
        orderId={orderId}
        salesChannel={data.salesChannel as "AL1" | "AL2"}
      />
    </FormWrapper>
  );
}
