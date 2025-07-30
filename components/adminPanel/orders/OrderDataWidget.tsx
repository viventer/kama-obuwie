import { OrderWithId } from "@/firebase/schemas/ordersSchemas";
import React from "react";
import { OrderInfoDisplay } from "./tables/OrderInfoDisplay";
import { OrderLineItemDisplay } from "./tables/OrderLineItemDisplay";

export default function OrderDataWidget({ data }: { data: OrderWithId }) {
  return (
    <section className="px-5 py-3 bg-foreground/10 rounded-sm w-fit">
      <h3 className="font-medium text-lg mb-2">Informacje o zamówieniu</h3>
      <div className="flex flex-wrap gap-8">
        <OrderInfoDisplay order={data as OrderWithId} />
        <OrderLineItemDisplay
          refund={data?.refund}
          lineItems={data.lineItems}
          className="max-h-[140px] overflow-auto scrollbar-thin pr-2"
        />
      </div>
    </section>
  );
}
