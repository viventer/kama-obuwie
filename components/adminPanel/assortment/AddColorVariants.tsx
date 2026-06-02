"use client";

import {
  AllegroColorWithShades,
  AllegroColorWithShadesResponse,
} from "@/app/api/allegro/parameters/shoeColors/route";
import { FormItem, FormLabel } from "@/components/ui/form";

import { ColorVariant } from "@/firebase/schemas/productsSchemas";

import axios from "axios";
import { useEffect, useState } from "react";
import MiniLoader from "../global/MiniLoader";
import ColorVariantValuesSelector from "./ColorVariantValuesSelector";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";

export default function AddColorVariants({
  value = [{ color: "", additionalColor: "", shade: "" }],
  onChange,
}: {
  value?: ColorVariant[];
  onChange: (value: ColorVariant[]) => void;
}) {
  const [colorOptions, setColorOptions] = useState<string[]>([]);
  const [additionalColorOptions, setAdditionalColorOptions] = useState<
    string[]
  >([]);
  const [colorsWithShades, setColorsWithShades] = useState<
    AllegroColorWithShades[]
  >([]);
  const [loading, setLoading] = useState(true);

  const { showToast } = useToast();

  useEffect(() => {
    (async function () {
      const { data } = await axios.get<AllegroColorWithShadesResponse>(
        `/api/allegro/parameters/shoeColors`
      );

      const {
        colors: allegroColors,
        additionalColors: allegroAdditionalColors,
        colorsWithShades: allegroColorsWithShades,
      } = data;

      if (
        !allegroColors ||
        !allegroAdditionalColors ||
        !allegroColorsWithShades
      ) {
        showToast("Błąd pobierania kolorów.", "error");
        return;
      }

      setColorOptions(allegroColors);
      setAdditionalColorOptions(allegroAdditionalColors);
      setColorsWithShades(allegroColorsWithShades);

      setLoading(false);
    })();
  }, []);

  const addEmpty = () => {
    onChange([...value, { color: "", additionalColor: "", shade: "" }]);
  };

  return (
    <FormItem>
      <FormLabel>Warianty kolorystyczne</FormLabel>
      {loading ? (
        <MiniLoader />
      ) : (
        value.map((colorVariant, index) => (
          <ColorVariantValuesSelector
            key={index}
            index={index}
            value={value}
            onChange={onChange}
            colorOptions={colorOptions}
            additionalColorOptions={additionalColorOptions}
            colorsWithShades={colorsWithShades}
          />
        ))
      )}
      {!loading && <Button onClick={addEmpty}>Dodaj wariant</Button>}
    </FormItem>
  );
}
