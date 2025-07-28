import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import SendRefundForm from "@/components/adminPanel/orders/forms/SendRefundForm";
import OrderDataWidget from "@/components/adminPanel/orders/OrderDataWidget";
import { OrderInfoDisplay } from "@/components/adminPanel/orders/OrderInfoDisplay";
import { OrderLineItemDisplay } from "@/components/adminPanel/orders/OrderLineItemDisplay";
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

  return (
    <FormWrapper headingText="Zwróć wpłatę">
      <OrderDataWidget data={data as OrderWithId} />
      <SendRefundForm order={data as OrderWithId} />
    </FormWrapper>
  );
}
