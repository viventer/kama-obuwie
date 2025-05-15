import {
  CategoryWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import { FormControl, FormLabel } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CategorySelector({
  value,
  onChange,
  rootCategory,
  setAllegroCategoryId,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  rootCategory: RootCategory | undefined;
  setAllegroCategoryId: Dispatch<SetStateAction<string | undefined>>;
}) {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<CategoryWithId[]>([]);

  useEffect(() => {
    (async function () {
      if (!rootCategory) return;

      const { data } = await axios.get<CategoryWithId[]>(`/api/categories`);

      if (!data) {
        showToast("Błąd pobierania kategorii.", "error");
        return;
      }

      const filteredCategories = Object.values(data)?.filter((category) => {
        return category.rootCategory === rootCategory;
      });

      setCategories(filteredCategories);
    })();
  }, [rootCategory]);

  useEffect(() => {
    const allegroCategoryId = categories.find(
      (category) => category.id === value
    )?.allegroCategoryId;

    if (allegroCategoryId) {
      console.log("Allegro category ID:", allegroCategoryId);
      setAllegroCategoryId(allegroCategoryId);
    }
  }, [value]);

  return (
    <div className={`${categories.length > 0 ? "block" : "hidden"}`}>
      <FormLabel className="mb-2">Kategoria</FormLabel>
      <FormControl>
        <Select value={value} onValueChange={onChange}>
          <SelectTrigger>
            <SelectValue placeholder="Wybierz" />
            <SelectContent className="bg-card border-primary">
              {categories.map((category, i) => (
                <SelectItem
                  key={i}
                  value={category.id}
                  className="text-base z-50 focus:bg-secondary focus:text-foreground dark:focus:text-text hover:cursor-pointer"
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </SelectTrigger>
        </Select>
      </FormControl>
    </div>
  );
}
