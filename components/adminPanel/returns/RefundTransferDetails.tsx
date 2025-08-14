import { CustomerBankAccountData } from "@/firebase/schemas/returnsSchemas";
import React from "react";

export default function RefundTransferDetails({
  accountData,
}: {
  accountData: CustomerBankAccountData;
}) {
  return (
    <div>
      <p>IBAN: {accountData.iban}</p>
      <p>SWIFT: {accountData.swift}</p>
      <p>Właściciel: {accountData.owner}</p>
      <p>
        {accountData.address.postCode} {accountData.address.city}
      </p>
      <p>{accountData.address.street}</p>
    </div>
  );
}
