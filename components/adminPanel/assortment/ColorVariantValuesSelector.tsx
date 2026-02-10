import { AllegroColorWithShades } from "@/app/api/allegro/parameters/shoeColors/route";
import IconButton from "@/components/adminPanel/global/IconButton";
import SingleSearchSelect from "@/components/adminPanel/global/form/SingleSearchSelect";
import { ColorVariant } from "@/firebase/schemas/productsSchemas";
import { TrashIcon } from "lucide-react";
import { useEffect, useState } from "react";

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
        (color) => color.color === selectedColor,
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
    <div className="flex flex-col gap-2 px-3 py-2 border-solid border-primary/50 border-[0.1rem] rounded-xs">
      <div className="flex items-center justify-between">
        <p className="font-black text-xl">{index + 1}</p>
        {index !== 0 ? (
          <IconButton
            className="hover:text-destructive"
            onClick={() => removeAt(index)}
          >
            <TrashIcon className="size-5" />
          </IconButton>
        ) : null}
      </div>
      <SingleSearchSelect
        label="Kolor główny"
        value={value[index].color}
        options={colorOptions.map((color) => ({ label: color, value: color }))}
        onChange={(value) => updateAt(index, { color: value })}
        placeholder="Wybierz kolor główny"
      />
      {availableShades.length > 0 ? (
        <SingleSearchSelect
          label="Odcień"
          value={value[index].shade}
          options={availableShades.map((shade) => ({
            label: shade,
            value: shade,
          }))}
          onChange={(value) => updateAt(index, { shade: value })}
          placeholder="Wybierz odcień"
        />
      ) : null}
      <SingleSearchSelect
        label="Kolor dodatkowy"
        value={value[index].additionalColor}
        options={additionalColorOptions.map((color) => ({
          label: color,
          value: color,
        }))}
        onChange={(value) => updateAt(index, { additionalColor: value })}
        placeholder="Wybierz kolor dodatkowy"
      />
    </div>
  );
}
