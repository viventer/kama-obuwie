import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import { Heading, Link, Section } from "@react-email/components";

export default function OrderStatusAndPayment({
  emailOrderData,
  baseUrl,
}: {
  emailOrderData: EmailOrderData;
  baseUrl: string;
}) {
  return (
    <Section className="py-[20px] px-10">
      <Heading as="h3" className="mt-0 mb-2">
        Sprawdź aktualny status zamówienia
      </Heading>
      {emailOrderData.orderDetails.status === "SENT" && (
        <Link
          href={`https://inpost.pl/sledzenie-przesylek?number=${emailOrderData.delivery.parcelNumber}`}
          className="bg-primary border-2 border-primary text-white font-medium px-3 py-1 rounded-sm inline-block mr-6a"
        >
          Śledź przesyłkę
        </Link>
      )}
      <Link
        href={`${baseUrl}/order/details/${emailOrderData.orderDetails.id}`}
        className="border-primary border-2 text-primary font-medium px-3 py-1 rounded-sm inline-block"
      >
        Szczegóły zamówienia
      </Link>
      {emailOrderData.orderDetails.status === "UNPAID" && (
        <>
          <Heading as="h3" className="mt-6 mb-2">
            Płatność się nie powiodła?
          </Heading>
          <Link
            href={`${baseUrl}/order/details/${emailOrderData.orderDetails.id}`}
            className="bg-primary border-2 border-primary text-white font-medium px-3 py-1 rounded-sm inline-block"
          >
            Ponów płatność
          </Link>
        </>
      )}
    </Section>
  );
}
