import { EmailOrderData } from "@/firebase/schemas/ordersSchemas";
import { Heading, Section, Text } from "@react-email/components";
import React from "react";

export default function OrderAddressData({
  emailOrderData,
}: {
  emailOrderData: EmailOrderData;
}) {
  return (
    <Section className="py-[20px] px-10">
      <Heading as="h2" className="mb-2 mt-0">
        Dane dostawy
      </Heading>
      <Text className="mb-1 mt-0">
        <span className="font-bold">Email: </span>
        {emailOrderData.buyer.email}
      </Text>
      <Text className="mb-1 mt-0">
        <span className="font-bold">Nr telefonu: </span>
        {emailOrderData.buyer.phoneNumber}
      </Text>
      <Text className="mb-1 mt-0">
        <span className="font-bold">Metoda: </span>
        {emailOrderData.paymentType === "COD"
          ? "Kurier InPost Pobranie"
          : emailOrderData.delivery.method === "courier"
            ? "Kurier InPost"
            : "Paczkomat InPost"}
      </Text>
      {emailOrderData.delivery.address && (
        <Section>
          <Text className="m-0 font-bold">Adres:</Text>
          <Text className="m-0">
            {emailOrderData.delivery.address.zipCode}{" "}
            {emailOrderData.delivery.address.city}
          </Text>
          <Text className="m-0">
            ul. {emailOrderData.delivery.address.street}{" "}
            {emailOrderData.delivery.address.buildingNumber}
            {emailOrderData.delivery.address.apartmentNumber
              ? `/${emailOrderData.delivery.address.apartmentNumber}`
              : ""}
          </Text>
        </Section>
      )}
      {emailOrderData.delivery.pickupPoint && (
        <Section>
          <Text className="mb-1 mt-0 font-bold">
            Paczkomat {emailOrderData.delivery.pickupPoint.name}
          </Text>
          <Text className="mb-1 mt-0">
            {emailOrderData.delivery.pickupPoint.address.city}
          </Text>
          <Text className="m-0">
            ul. {emailOrderData.delivery.pickupPoint.address.street}
          </Text>
        </Section>
      )}
    </Section>
  );
}
