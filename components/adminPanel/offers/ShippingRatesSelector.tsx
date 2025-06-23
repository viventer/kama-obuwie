"use client";

import { useFormContext } from "react-hook-form";
import { EditOfferFormValues } from "./EditOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";
import { redirect } from "next/navigation";

export type ShippingRate = {
  id: string;
  name: string;
  marketplaces: object;
};

export default function ShippingRatesSelector() {
  const [availableShippingRates, setAvailableShippingRates] = useState<
    ShippingRate[]
  >([]);

  const { control } = useFormContext<EditOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/shipping-rates");
      setAvailableShippingRates(resp.data.shippingRates);

      console.log(resp.data);
    })();
  }, []);

  return availableShippingRates && availableShippingRates.length > 0 ? (
    <FormField
      rules={{ required: "Cennik dostaw jest wymagany." }}
      control={control}
      name="shippingRates.AL1.allegroId"
      render={({ field }) => (
        <SingleSelect
          label="Cennik dostaw"
          onChange={field.onChange}
          value={field.value}
          availableOptions={availableShippingRates.map((rate) => ({
            name: rate.name,
            value: rate.id,
          }))}
        />
      )}
    />
  ) : (
    <MiniLoader />
  );
}
