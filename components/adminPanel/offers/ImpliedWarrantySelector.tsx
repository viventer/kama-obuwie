"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField, FormLabel } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";
import { allegroSalesChannels } from "@/lib/constants";

export type ImpliedWarranty = {
  id: string;
  name: string;
};

export type ImpliedWarrantiesResponse = {
  AL1: ImpliedWarranty[];
  AL2: ImpliedWarranty[];
};

export default function ImpliedWarrantySelector() {
  const [availableImpliedWarranties, setAvailableImpliedWarranties] =
    useState<ImpliedWarrantiesResponse>();

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const { data }: { data: ImpliedWarrantiesResponse } = await axios.get(
        "/api/allegro/implied-warranties"
      );
      setAvailableImpliedWarranties(data);
    })();
  }, []);

  return availableImpliedWarranties &&
    availableImpliedWarranties.AL1.length > 0 &&
    availableImpliedWarranties.AL2.length > 0 ? (
    <div>
      <h3 className="font-medium">Warunki reklamacji</h3>
      {allegroSalesChannels.map((channel) => (
        <div key={channel} className="mt-2">
          <FormLabel className="text-sm opacity-85 font-normal">
            {channel}
          </FormLabel>
          <FormField
            rules={{
              required: `Warunki reklamacji dla ${channel} są wymagane.`,
            }}
            control={control}
            name={`impliedWarranty.${channel}`}
            render={({ field }) => (
              <SingleSelect
                onChange={field.onChange}
                value={field.value}
                availableOptions={availableImpliedWarranties[channel].map(
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
