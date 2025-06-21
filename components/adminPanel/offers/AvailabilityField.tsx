"use client";

import { useFormContext } from "react-hook-form";
import { EditOfferFormValues } from "./EditOfferForm";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { salesChannels } from "@/lib/constants";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import axios from "axios";
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import MiniLoader from "../global/MiniLoader";

export default function AvailabilityField({
  sizingTableId,
}: {
  sizingTableId: string;
}) {
  const [sizes, setSizes] = useState<string[]>([]);
  const { control } = useFormContext<EditOfferFormValues>();

  useEffect(() => {
    (async () => {
      console.log(sizingTableId);
      const { data }: { data: SizingTableWithId } = await axios.get(
        `/api/sizing-tables/${sizingTableId}`
      );
      const respSizes = data.insoleLengths.map((item) => item.size.toString());
      setSizes(respSizes);
    })();
  }, []);

  return (
    <div>
      <h3 className="font-medium">Dostępność</h3>
      <div className="mt-2 flex gap-3 flex-wrap max-w-md">
        {sizes.length === 0 ? (
          <MiniLoader />
        ) : (
          sizes.map((size) => (
            <FormField
              key={size}
              control={control}
              name={`availability.${size}.value`}
              render={({ field }) => (
                <FormItem className="w-[70px]">
                  <FormLabel className="text-sm opacity-85 font-normal">
                    r. {size}
                  </FormLabel>
                  <Input
                    type="number"
                    value={field.value || ""}
                    onChange={field.onChange}
                    min={0}
                    max={10000}
                    className="no-spinner"
                  />
                </FormItem>
              )}
            />
          ))
        )}
      </div>
    </div>
  );
}
