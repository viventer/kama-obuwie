import { Order } from "@/firebase/schemas/ordersSchemas";
import React from "react";

export default function InvoiceInfo({ data }: { data: Order["invoice"] }) {
  if (!data) {
    return <div>Brak danych faktury</div>;
  }

  const { address, isAdded } = data;

  const idTypeTranslation = {
    PL_NIP: "NIP",
    VAT_EU: "VAT EU",
    OTHER: "inny",
  };

  return (
    <div className="flex flex-col gap-4">
      <section>
        <h3 className="font-medium text-lg">Adres</h3>{" "}
        <p>{address.company.name}</p>
        <p>{address.street}</p>
        <p>
          {address.zipCode} {address.city}
        </p>
      </section>
      <ul>
        {address.company.ids?.map((id) => (
          <li key={id.value}>
            <span className="font-medium">{idTypeTranslation[id.type]}: </span>
            {id.value}
          </li>
        ))}
      </ul>
    </div>
  );
}
