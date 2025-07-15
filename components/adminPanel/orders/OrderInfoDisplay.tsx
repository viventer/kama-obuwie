import { Order } from "@/firebase/schemas/ordersSchemas";

interface OrderInfoDisplayProps {
  order: Order;
}

export function OrderInfoDisplay({ order }: OrderInfoDisplayProps) {
  const date = new Date(order.createdAt);

  return (
    <div className="space-y-1">
      <div className="font-medium text-sm">
        {date.toLocaleDateString("pl-PL", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })}
        <span className="ml-2 text-xs text-gray-500">
          {date.toLocaleTimeString("pl-PL", {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
      </div>
      <div className="font-mono text-sm font-medium">#{order.number}</div>
      <div className="font-medium text-sm">
        <span className="font-light">Całkowita wpłata:</span>{" "}
        {order.summary.totalToPay.amount} {order.summary.totalToPay.currency}
      </div>
    </div>
  );
}
