"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField, FormLabel } from "@/components/ui/form";
import SingleSelect from "../../global/form/SingleSelect";
import MiniLoader from "../../global/MiniLoader";
import { allegroSalesChannels } from "@/lib/constants";

export type ReturnPolicy = {
  id: string;
  name: string;
};

export type ReturnPoliciesResponse = {
  AL1: ReturnPolicy[];
  AL2: ReturnPolicy[];
};

export default function ReturnPolicySelector() {
  const [availableReturnPolicies, setAvailableReturnPolicies] =
    useState<ReturnPoliciesResponse>();

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const { data }: { data: ReturnPoliciesResponse } = await axios.get(
        "/api/allegro/return-policies"
      );
      setAvailableReturnPolicies(data);
    })();
  }, []);

  return availableReturnPolicies &&
    availableReturnPolicies.AL1.length &&
    availableReturnPolicies.AL2.length > 0 ? (
    <div>
      <h3 className="font-medium">Polityki zwrotów</h3>
      {allegroSalesChannels.map((channel) => (
        <div key={channel} className="mt-2">
          <FormLabel className="text-sm opacity-85 font-normal">
            {channel}
          </FormLabel>
          <FormField
            rules={{
              required: `Polityka zwrotów dla ${channel} jest wymagana.`,
            }}
            control={control}
            name={`returnPolicy.${channel}`}
            render={({ field }) => (
              <SingleSelect
                onChange={field.onChange}
                value={field.value}
                availableOptions={availableReturnPolicies[channel].map(
                  (policy) => ({
                    name: policy.name,
                    value: policy.id,
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
