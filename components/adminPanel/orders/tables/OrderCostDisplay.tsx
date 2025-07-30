import { Order } from "@/firebase/schemas/ordersSchemas";

export default function OrderCostDisplay({ order }: { order: Order }) {
  const refundedAmount = Number(order.refund?.amount?.amount) || 0;
  const productsCost = order.lineItems.reduce(
    (total, item) => total + Number(item.price.amount) * item.quantity,
    0
  );

  return (
    <div>
      {" "}
      {order?.delivery?.method && order.delivery?.cost && (
        <div>
          {order.delivery.method.name}{" "}
          <span className="font-medium">
            {order.delivery.cost.amount} {order.delivery.cost.currency}
          </span>
        </div>
      )}
      <div>
        Produkty:{" "}
        <span className="font-medium">
          {productsCost - refundedAmount} {order.lineItems[0]?.price.currency}
        </span>
      </div>
      <div className="font-medium text-sm">
        <span className="font-light">Suma:</span>{" "}
        {order.summary.totalToPay.amount} {order.summary.totalToPay.currency}
      </div>
    </div>
  );
}
