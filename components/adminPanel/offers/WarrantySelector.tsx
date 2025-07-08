"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField, FormLabel } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";
import { allegroSalesChannels } from "@/lib/constants";

export type Warranty = {
  id: string;
  name: string;
};

export type WarrantiesResponse = {
  AL1: Warranty[];
  AL2: Warranty[];
};

export default function WarrantySelector() {
  const [availableWarranties, setAvailableWarranties] =
    useState<WarrantiesResponse>();

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const { data }: { data: WarrantiesResponse } = await axios.get(
        "/api/allegro/warranties"
      );
      setAvailableWarranties(data);
    })();
  }, []);

  return availableWarranties &&
    availableWarranties.AL1.length > 0 &&
    availableWarranties.AL2.length > 0 ? (
    <div>
      <h3 className="font-medium">Warunki gwarancji</h3>
      {allegroSalesChannels.map((channel) => (
        <div key={channel} className="mt-2">
          <FormLabel className="text-sm opacity-85 font-normal">
            {channel}
          </FormLabel>
          <FormField
            control={control}
            name={`warranty.${channel}`}
            render={({ field }) => (
              <SingleSelect
                onChange={field.onChange}
                value={field.value}
                availableOptions={availableWarranties[channel].map(
                  (warranty) => ({
                    name: warranty.name,
                    value: warranty.id,
                  })
                )}
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
