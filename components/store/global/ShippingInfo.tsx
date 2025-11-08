import { getShippingInfo } from "@/helpers/store";
import { ClockIcon } from "lucide-react";

export default function ShippingInfo({ className }: { className?: string }) {
  return (
    <p className={`flex items-center gap-2 font-medium ${className}`}>
      <ClockIcon className="size-5 text-success" />
      {getShippingInfo()}
    </p>
  );
}
