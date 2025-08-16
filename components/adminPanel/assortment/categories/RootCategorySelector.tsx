import {
  RootCategory,
  RootCategoryValues,
} from "@/firebase/schemas/productsSchemas";
import SingleSelect from "../../global/form/SingleSelect";

export default function RootCategorySelector({
  onChange,
  value,
  defaultValue,
  disabled = false,
}: {
  onChange: (...event: any[]) => void;
  value: RootCategory | undefined;
  defaultValue?: RootCategory;
  disabled?: boolean;
}) {
  return (
    <SingleSelect
      label="Kategoria główna"
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      availableOptions={RootCategoryValues.map((rootCategory) => ({
        name: rootCategory,
        value: rootCategory,
      }))}
      disabled={disabled}
    />
  );
}
