"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";

export type ReturnPolicy = {
  id: string;
  name: string;
};

export default function ReturnPolicySelector() {
  const [availableReturnPolicies, setAvailableReturnPolicies] = useState<
    ReturnPolicy[]
  >([]);

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/return-policies");
      setAvailableReturnPolicies(Object.values(resp.data));
    })();
  }, []);

  return availableReturnPolicies && availableReturnPolicies.length > 0 ? (
    <FormField
      rules={{ required: "Polityka zwrotów jest wymagana." }}
      control={control}
      name="returnPolicy.AL1"
      render={({ field }) => (
        <SingleSelect
          label="Polityka zwrotów"
          onChange={field.onChange}
          value={field.value}
          availableOptions={availableReturnPolicies.map((policy) => ({
            name: policy.name,
            value: policy.id,
          }))}
        />
      )}
    />
  ) : (
    <MiniLoader />
  );
}
