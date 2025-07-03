"use client";

import { useFormContext } from "react-hook-form";
import { PostOfferFormValues } from "./PostOfferForm";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField } from "@/components/ui/form";
import SingleSelect from "../global/form/SingleSelect";
import MiniLoader from "../global/MiniLoader";

export type ImpliedWarranty = {
  id: string;
  name: string;
};

export default function ImpliedWarrantySelector() {
  const [available, setAvailable] = useState<ImpliedWarranty[]>([]);

  const { control } = useFormContext<PostOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/implied-warranties");
      setAvailable(Object.values(resp.data));
    })();
  }, []);

  return available && available.length > 0 ? (
    <FormField
      rules={{ required: "Warunki reklamacji są wymagane." }}
      control={control}
      name="impliedWarranty.AL1"
      render={({ field }) => (
        <SingleSelect
          label="Warunki reklamacji"
          onChange={field.onChange}
          value={field.value}
          availableOptions={available.map((impliedWarranty) => ({
            name: impliedWarranty.name,
            value: impliedWarranty.id,
          }))}
        />
      )}
    />
  ) : (
    <MiniLoader />
  );
}
