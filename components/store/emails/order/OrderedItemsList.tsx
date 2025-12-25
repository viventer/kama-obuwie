import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import {
  Column,
  Heading,
  Img,
  Row,
  Section,
  Text,
} from "@react-email/components";

export default function OrderedItemsList({
  emailOrderData,
}: {
  emailOrderData: EmailOrderData;
}) {
  const isCancelled = emailOrderData.orderDetails.status === "CANCELLED";

  return (
    <Section className="py-[20px] px-10">
      <Heading as="h2" className="mb-2 mt-0">
        Zamówione produkty
      </Heading>
      {emailOrderData.orderedItems.map((item) => (
        <Row
          key={item.id}
          className={`mb-4 bg-card rounded-lg p-3 ${isCancelled ? "opacity-50" : ""}`}
        >
          <Column className="w-[120px]">
            <Img
              src={item.offer.thumbnail}
              alt={item.offer.name || "produkt"}
              width={120}
              height={120}
              className="rounded-xl"
            />
          </Column>
          <Column className="pl-4 align-middle">
            <Text className="mt-0 mb-1 text-[18px] font-medium">
              {item.offer.signature}
            </Text>
            <Text className="mt-0 mb-1 text-[18px]">
              {Number(item.price.amount).toFixed(2)} {item.price.currency}
            </Text>
            <Text className="mt-0 mb-0 text-[14px] text-muted-foreground">
              {item.offer.size && `r. ${item.offer.size}`}
              &nbsp;&nbsp;&nbsp;&nbsp;ilość: {item.quantity}
            </Text>
          </Column>
        </Row>
      ))}
      <Row>
        <Text className="text-lg mb-2">
          <span className="font-medium">Koszt dostawy: </span>
          {isCancelled ? (
            <s className="text-muted-foreground">
              {Number(emailOrderData.deliveryPrice.amount).toFixed(2)}{" "}
              {emailOrderData.deliveryPrice.currency}
            </s>
          ) : (
            <>
              {Number(emailOrderData.deliveryPrice.amount).toFixed(2)}{" "}
              {emailOrderData.deliveryPrice.currency}
            </>
          )}
        </Text>
        <Text className="text-lg mt-0">
          <span className="font-medium">Łączna kwota: </span>
          {isCancelled ? (
            <>
              <s className="text-muted-foreground">
                {Number(emailOrderData.totalToPay.amount).toFixed(2)}{" "}
                {emailOrderData.totalToPay.currency}
              </s>{" "}
              0 zł
            </>
          ) : (
            <>
              {Number(emailOrderData.totalToPay.amount).toFixed(2)}{" "}
              {emailOrderData.totalToPay.currency}
            </>
          )}
        </Text>
      </Row>
    </Section>
  );
}
