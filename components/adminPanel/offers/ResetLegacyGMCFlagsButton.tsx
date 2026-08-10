"use client";

import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import { useFullPageLoading } from "../global/FullPageLoader";
import { resetLegacyOffersMerchantCenterFlags } from "@/server-actions/merchantCenter/manageProducts";
import { useRouter } from "next/navigation";

export default function ResetLegacyGMCFlagsButton() {
  const { showToast } = useToast();
  const { startLoading, stopLoading } = useFullPageLoading();
  const router = useRouter();

  const handleReset = async () => {
    const confirmed = window.confirm(
      "Zresetować isAddedToMerchantCenter dla wszystkich ofert legacy? Używaj tylko do naprawy fałszywych flag.",
    );
    if (!confirmed) return;

    try {
      startLoading();
      const { resetCount } = await resetLegacyOffersMerchantCenterFlags();
      stopLoading();
      showToast(
        `Zresetowano flagi GMC dla ${resetCount} ofert legacy.`,
        "success",
      );
      router.refresh();
    } catch (err) {
      stopLoading();
      console.error("Error resetting legacy GMC flags:", err);
      showToast(
        err instanceof Error
          ? err.message
          : "Nie udało się zresetować flag GMC dla ofert legacy.",
        "error",
      );
    }
  };

  return (
    <Button variant="outline" onClick={handleReset}>
      Reset flag GMC (legacy)
    </Button>
  );
}
