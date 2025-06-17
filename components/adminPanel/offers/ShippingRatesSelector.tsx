"use client";

import { useFormContext } from "react-hook-form";
import { EditOfferFormValues } from "./EditOfferForm";
import { useEffect } from "react";
import axios from "axios";

export default function ShippingRatesSelector() {
  const { control } = useFormContext<EditOfferFormValues>();

  useEffect(() => {
    (async () => {
      const resp = await axios.get("/api/allegro/shipping-rates");

      console.log(resp.data);
    })();
  }, []);

  return <div>ShippingRatesSelector</div>;
}
