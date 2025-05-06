"use client";

import {
  AllegroColorWithShades,
  AllegroColorWithShadesResponse,
} from "@/app/api/allegro/parameters/shoeColors/route";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { useEffect, useState } from "react";

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
      onChange([
        {
          color: "",
          additionalColor: "",
          shade: "",
        },
      ]);

      setLoading(false);
    })();
  }, []);

  const updateAt = (index: number, patch: Partial<ColorVariant>) => {
    const newArr = value.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(newArr);
  };

  const removeAt = (index: number) => {
    const newArr = value.filter((_, i) => i !== index);
    onChange(newArr);
  };

  const addEmpty = () => {
    onChange([
      ...value,
      { color: "", additionalColor: undefined, shade: undefined },
    ]);
  };

  return (
    <FormItem>
      <FormLabel>Warianty kolorystyczne</FormLabel>
      {loading ? (
        <p>ładowanie</p>
      ) : (
        value.map((colorVariant, index) => (
          <FormControl key={index}>
            <Select
              value={value[0].color}
              onValueChange={(value) => updateAt(index, { color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz kolor" />
                <SelectContent className="bg-card border-primary">
                  {colorOptions.map((color, i) => (
                    <SelectItem
                      key={i}
                      value={color}
                      className="text-base z-50 focus:bg-secondary focus:text-background dark:focus:text-text hover:cursor-pointer"
                    >
                      {color}
                    </SelectItem>
                  ))}
                </SelectContent>
              </SelectTrigger>
            </Select>
          </FormControl>
        ))
      )}
    </FormItem>
  );
}
