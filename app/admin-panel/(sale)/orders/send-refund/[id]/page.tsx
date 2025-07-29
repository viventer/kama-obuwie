import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import SendRefundForm from "@/components/adminPanel/orders/forms/SendRefundForm";
import OrderDataWidget from "@/components/adminPanel/orders/OrderDataWidget";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Zwróć wpłatę`,
  };
}

export default async function SendRefundPage(props: Props) {
  const { id } = await props.params;
  const { data } = await getDocumentFromAdminDB<OrderWithId>("orders", id);

  if (!data) {
    return notFound();
  }

  if (!data.payment?.paidAmount || !data.payment?.id) {
    return notFound();
  }

  return (
    <FormWrapper headingText="Zwróć wpłatę">
      <OrderDataWidget data={data as OrderWithId} />
      <SendRefundForm
        refund={data?.refund}
        paymentId={data.payment?.id}
        lineItems={data.lineItems}
        salesChannel={data.salesChannel}
      />
    </FormWrapper>
  );
}
