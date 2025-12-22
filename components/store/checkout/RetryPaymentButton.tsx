"use client";

import { useFullPageLoading } from "@/components/adminPanel/global/FullPageLoader";
import { Button } from "@/components/ui/button";
import { RegisterTransactionData } from "@/firebase/schemas/p24Schemas";
import { handleApiError } from "@/server-actions/errorHandlers";
import axios from "axios";

export default function RetryPaymentButton({
  transactionData,
  orderId,
}: {
  transactionData: Pick<
    RegisterTransactionData,
    "amount" | "email" | "channel"
  >;
  orderId: string;
}) {
  const { startLoading, stopLoading } = useFullPageLoading();

  const retryPayment = async () => {
    startLoading();
    try {
      const { data: p24Response } = await axios.post("/api/p24/register", {
        transactionData,
        orderId,
      });
      window.location.href = p24Response.url;
    } catch (err) {
      handleApiError(err, "Błąd podczas rejestracji transakcji P24.");
      return;
    } finally {
      stopLoading();
    }
  };

  return (
    <Button variant={"important"} onClick={retryPayment}>
      Ponów płatność
    </Button>
  );
}
