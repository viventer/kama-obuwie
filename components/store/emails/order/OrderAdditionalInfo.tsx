import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import { Heading, Section, Text } from "@react-email/components";

export default function OrderAdditionalInfo({
  emailOrderData,
}: {
  emailOrderData: EmailOrderData;
}) {
  const isCancelled = emailOrderData.orderDetails.status === "CANCELLED";

  return (
    <Section className="py-[20px] px-10">
      <Heading as="h2" className="mb-2 mt-0">
        Dodatkowe informacje
      </Heading>
      <Text className="mb-1 mt-0 text-base">
        <span className="font-bold">Numer zamówienia: </span>#
        {emailOrderData.orderDetails.number}
      </Text>
      <Text className="mb-1 mt-0 text-base">
        <span className="font-bold">Data złożenia zamówienia: </span>
        {new Date(emailOrderData.orderDetails.createdAt).toLocaleString(
          "pl-PL",
          {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
          }
        )}
      </Text>
      {isCancelled ? null : (
        <Text className="m-0 text-base">
          <span className="font-bold">Przewidywany czas dostawy: </span>
          {emailOrderData.orderDetails.deliveryDate}
        </Text>
      )}
      {emailOrderData.orderDetails.status === "UNPAID" && (
        <Text className="m-0 mt-1">
          Przewidywany czas dostawy zakłada otrzymanie płatności za zamówienie w
          momencie jego złożenia.
        </Text>
      )}
    </Section>
  );
}
