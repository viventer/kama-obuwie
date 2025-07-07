"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField, FormLabel } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";
import { allegroSalesChannels } from "@/lib/constants";

export type ShippingRate = {
  id: string;
  name: string;
  marketplaces: object;
};

export default function ShippingRatesSelector() {
  const [availableShippingRates, setAvailableShippingRates] = useState<
    ShippingRate[]
  >([]);

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/shipping-rates");
      setAvailableShippingRates(resp.data.shippingRates);
    })();
  }, []);

  return availableShippingRates && availableShippingRates.length > 0 ? (
    <div>
      <h3 className="font-medium">Cenniki dostaw</h3>
      {allegroSalesChannels.map((channel) => (
        <div key={channel} className="mt-2">
          <FormLabel className="text-sm opacity-85 font-normal">
            {channel}
          </FormLabel>
          <FormField
            rules={{ required: `Cennik dostaw dla ${channel} jest wymagany.` }}
            control={control}
            name={`shippingRates.${channel}.allegroId`}
            render={({ field }) => (
              <SingleSelect
                onChange={field.onChange}
                value={field.value}
                availableOptions={availableShippingRates.map((rate) => ({
                  name: rate.name,
                  value: rate.id,
                }))}
              />
            )}
          />
        </div>
      ))}
    </div>
  ) : (
    <MiniLoader />
  );
}
