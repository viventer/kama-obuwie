"use client";

import { AllegroReturn } from "@/firebase/schemas/returnsSchemas";
import { cn } from "@/lib/utils";

interface ReturnBuyerDataDisplayProps {
  return: AllegroReturn;
  className?: string;
}

export function ReturnBuyerDataDisplay({
  return: returnData,
  className,
}: ReturnBuyerDataDisplayProps) {
  const firstParcel = returnData.parcels?.[0];

  return (
    <div className={cn("space-y-2", className)}>
      <div className="space-y-1">
        <p>Login: {returnData.buyer.login}</p>
        <p>Email: {returnData.buyer.email}</p>
        {firstParcel?.sender.phoneNumber && (
          <p>Telefon: {firstParcel.sender.phoneNumber}</p>
        )}
        {returnData.refund?.bankAccount?.iban && (
          <p className="font-mono">{returnData.refund.bankAccount.iban}</p>
        )}
      </div>
    </div>
  );
}
