import {
  CategoryWithId,
  RootCategory,
} from "@/firebase/schemas/productsSchemas";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import axios from "axios";
import { useToast } from "@/hooks/useToast";
import SingleSelect from "../../global/form/SingleSelect";

export default function CategorySelector({
  value,
  onChange,
  rootCategory,
  setAllegroCategoryId,
  disabled = false,
}: {
  value: string | undefined;
  onChange: (value: string) => void;
  rootCategory: RootCategory | undefined;
  setAllegroCategoryId: Dispatch<SetStateAction<string | undefined>>;
  disabled?: boolean;
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
      setAllegroCategoryId(allegroCategoryId);
    }
  }, [value]);

  return (
    <div className={`${categories.length > 0 ? "block" : "hidden"}`}>
      <SingleSelect
        label="Kategoria"
        onChange={onChange}
        value={value}
        availableOptions={categories.map((category) => ({
          name: category.name,
          value: category.id,
        }))}
        disabled={disabled}
      />
    </div>
  );
}
