"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";

export type Warranty = {
  id: string;
  name: string;
};

export default function WarrantySelector() {
  const [available, setAvailable] = useState<Warranty[]>([]);

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/warranties");
      setAvailable(Object.values(resp.data));
    })();
  }, []);

  return available && available.length > 0 ? (
    <FormField
      control={control}
      name="warranty.AL1"
      render={({ field }) => (
        <SingleSelect
          label="Warunki gwarancji"
          onChange={field.onChange}
          value={field.value}
          availableOptions={available.map((warranty) => ({
            name: warranty.name,
            value: warranty.id,
          }))}
        />
      )}
    />
  ) : (
    <MiniLoader />
  );
}
