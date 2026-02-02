"use client";

import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import { Button } from "@/components/ui/button";
import {
  getExistingGcpRegistration,
  registerGcpWithMerchant,
  syncOffersWithGoogleMerchantCenter,
} from "@/server-actions/merchantCenter/manageProducts";
import { useState } from "react";
import BarLoader from "react-spinners/BarLoader";

export default function GoogleMerchantCenterPage() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAddOffers = async () => {
    setIsLoading(true);
    await getExistingGcpRegistration();
    // await registerGcpWithMerchant();
    await syncOffersWithGoogleMerchantCenter();
    setIsLoading(false);
  };

  return (
    <section>
      <SubpageHeading text="Google Merchant Center" />
      <h3 className="text-lg font-medium mb-2">
        Dodaj brakujące oferty do Google Merchant Center
      </h3>
      {isLoading ? (
        <BarLoader />
      ) : (
        <Button onClick={handleAddOffers}>Dodaj</Button>
      )}
    </section>
  );
}
