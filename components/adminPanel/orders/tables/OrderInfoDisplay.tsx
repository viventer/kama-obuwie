import { Order } from "@/firebase/schemas/ordersSchemas";
import { PhoneIcon, UserIcon } from "lucide-react";

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

      <div className="text-sm">
        <div className="font-medium">
          {order.buyer.firstName && order.buyer.lastName
            ? `${order.buyer.firstName} ${order.buyer.lastName}`
            : order.buyer.companyName || "Brak nazwy"}
        </div>
        {order.buyer.phoneNumber && (
          <div className="text-xs flex items-center gap-1">
            <PhoneIcon className="size-3" /> {order.buyer.phoneNumber}
          </div>
        )}
        <div className="text-xs flex items-center gap-1">
          <UserIcon className="size-3" />{" "}
          {order.buyer.login || order.buyer.email}
        </div>
      </div>
    </div>
  );
}
