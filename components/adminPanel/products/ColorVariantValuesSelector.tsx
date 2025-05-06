import { AllegroColorWithShades } from "@/app/api/allegro/parameters/shoeColors/route";
import IconButton from "@/components/global/IconButton";
import { FormControl, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { DeleteIcon, TrashIcon } from "lucide-react";
import { Fragment, useEffect, useState } from "react";

export default function ColorVariantValuesSelector({
  value,
  onChange,
  colorOptions,
  additionalColorOptions,
  index,
  colorsWithShades,
}: {
  value: ColorVariant[];
  onChange: (value: ColorVariant[]) => void;
  colorOptions: string[];
  additionalColorOptions: string[];
  index: number;
  colorsWithShades: AllegroColorWithShades[];
}) {
  const [availableShades, setAvailableShades] = useState<string[]>([]);

  useEffect(() => {
    if (value.length > 0) {
      const selectedColor = value[index].color;

      const selectedColorWithShades = colorsWithShades.find(
        (color) => color.color === selectedColor
      );

      if (selectedColorWithShades) {
        setAvailableShades(selectedColorWithShades.shades);
      } else {
        setAvailableShades([]);
      }
    }
  }, [value]);

  const updateAt = (index: number, patch: Partial<ColorVariant>) => {
    const newArr = value.map((v, i) => (i === index ? { ...v, ...patch } : v));
    onChange(newArr);
  };

  const removeAt = (index: number) => {
    const newArr = value.filter((_, i) => i !== index);
    onChange(newArr);
  };

  return (
    <div className="flex flex-col gap-2 px-3 py-2 border-solid border-primary/50 border-[0.1rem] rounded-sm">
      <div className="flex items-center justify-between">
        <p className="font-black text-xl">{index + 1}</p>
        {index !== 0 ? (
          <IconButton
            className="hover:text-destructive"
            onClick={() => removeAt(index)}
          >
            <TrashIcon />
          </IconButton>
        ) : null}
      </div>
      <FormLabel className="font-normal text-sm">Kolor główny</FormLabel>
      <FormControl>
        <Select
          value={value[index].color}
          onValueChange={(value) => updateAt(index, { color: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz kolor główny" />
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
      <FormLabel className="font-normal text-sm">Kolor dodatkowy</FormLabel>
      <FormControl>
        <Select
          value={value[index].additionalColor}
          onValueChange={(value) => updateAt(index, { additionalColor: value })}
        >
          <SelectTrigger>
            <SelectValue placeholder="Wybierz kolor dodatkowy" />
            <SelectContent className="bg-card border-primary">
              {additionalColorOptions.map((color, i) => (
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
      {availableShades.length > 0 ? (
        <>
          <FormLabel className="font-normal text-sm">Odcień</FormLabel>
          <FormControl>
            <Select
              value={value[index].shade}
              onValueChange={(value) => updateAt(index, { shade: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Wybierz odcień" />
                <SelectContent className="bg-card border-primary">
                  {availableShades.map((shade, i) => {
                    return (
                      <SelectItem
                        key={i}
                        value={shade}
                        className="text-base z-50 focus:bg-secondary focus:text-background dark:focus:text-text hover:cursor-pointer"
                      >
                        {shade}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </SelectTrigger>
            </Select>
          </FormControl>
        </>
      ) : null}
    </div>
  );
}
