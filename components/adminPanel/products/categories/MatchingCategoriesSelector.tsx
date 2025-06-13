import {
  CategoryWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import SingleSelect from "../../global/form/SingleSelect";
import MultipleSelect from "../../global/form/MultipleSelect";

export default function MatchingCategoriesSelector({
  value,
  onChange,
  rootCategory,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  rootCategory: RootCategory | undefined;
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

  return (
    <div className={`${categories.length > 0 ? "block" : "hidden"}`}>
      <MultipleSelect
        label="Pasujące kategorie"
        onChange={onChange}
        value={value}
        availableOptions={categories.map((category) => ({
          name: category.name,
          value: category.id,
        }))}
      />
    </div>
  );
}
