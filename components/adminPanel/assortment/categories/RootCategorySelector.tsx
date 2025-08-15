import {
  RootCategory,
  RootCategoryValues,
} from "@/firebase/schemas/productsSchemas";
import SingleSelect from "../../global/form/SingleSelect";

export default function RootCategorySelector({
  onChange,
  value,
  defaultValue,
}: {
  onChange: (...event: any[]) => void;
  value: RootCategory | undefined;
  defaultValue?: RootCategory;
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
    />
  );
}
