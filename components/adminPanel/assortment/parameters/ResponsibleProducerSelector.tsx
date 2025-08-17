"use client";

import { useFormContext } from "react-hook-form";
import { useEffect, useState } from "react";
import axios from "axios";
import { FormField, FormLabel } from "@/components/ui/form";

import { allegroSalesChannels } from "@/lib/constants";
import { ProductParametersFormData } from "./EditProductParametersForm";
import { ResponsibleProducersResponse } from "@/server-actions/allegro/responsibleProducers";
import SingleSelect from "../../global/form/SingleSelect";
import MiniLoader from "../../global/MiniLoader";

export default function ResponsibleProducerSelector({
  disabled = false,
}: {
  disabled?: boolean;
}) {
  const [availableResponsibleProducers, setAvailableResponsibleProducers] =
    useState<ResponsibleProducersResponse>();

  const { control } = useFormContext<ProductParametersFormData>();

  useEffect(() => {
    (async () => {
      const { data }: { data: ResponsibleProducersResponse } = await axios.get(
        "/api/allegro/responsible-producers"
      );
      setAvailableResponsibleProducers(data);
    })();
  }, []);

  return availableResponsibleProducers &&
    availableResponsibleProducers.AL1.length &&
    availableResponsibleProducers.AL2.length > 0 ? (
    <div>
      <h3 className="font-medium">Producent odpowiedzialny</h3>
      {allegroSalesChannels.map((channel) => (
        <div key={channel} className="mt-2">
          <FormLabel className="text-sm opacity-85 font-normal">
            {channel}
          </FormLabel>
          <FormField
            rules={{
              required: `Producent odpowiedzialny dla ${channel} jest wymagany.`,
            }}
            control={control}
            name={`responsibleProducer.${channel}`}
            render={({ field }) => (
              <SingleSelect
                onChange={field.onChange}
                value={field.value}
                availableOptions={availableResponsibleProducers[channel].map(
                  (producer) => ({
                    name: producer.name,
                    value: producer.name,
                  })
                )}
                disabled={disabled}
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
