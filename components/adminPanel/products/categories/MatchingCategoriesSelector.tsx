import {
  CategoryWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import MultipleSearchSelect from "../../global/form/MultipleSearchSelect";

export default function MatchingCategoriesSelector({
  value,
  onChange,
  rootCategory,
  mainCategoryId,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  rootCategory: RootCategory | undefined;
  mainCategoryId: string | undefined;
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
        return (
          category.rootCategory === rootCategory &&
          category.id !== mainCategoryId
        );
      });

      setCategories(filteredCategories);
    })();
  }, [rootCategory, mainCategoryId]);

  return (
    <div className={`${categories.length > 0 ? "block" : "hidden"}`}>
      <MultipleSearchSelect
        label="Pasujące kategorie"
        onChange={onChange}
        value={value}
        options={categories.map((category) => ({
          label: category.name,
          value: category.id,
        }))}
      />
    </div>
  );
}
