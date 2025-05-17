import { AllegroProductParameter } from "@/server-actions/allegro/products";
import MultipleSelect from "../global/form/MultipleSelect";
import SingleSelect from "../global/form/SingleSelect";
import InputFormItem from "../global/form/InputFormItem";
import { ProductParameters } from "@/firebase/schemas/productsSchemas";

export default function AllegroParametersSectionFormItem({
  parameter,
  onChange,
  optionalValues,
  requiredValues,
}: {
  parameter: AllegroProductParameter;
  onChange: (newParams: ProductParameters) => void;
  optionalValues: Record<
    string,
    string | number | boolean | string[] | number[]
  >;
  requiredValues: Record<
    string,
    string | number | boolean | string[] | number[]
  >;
}) {
  const nameKey = parameter.name;
  const current = (requiredValues[nameKey] as string) || "";

  const handleParamChange = (
    nameKey: string,
    val: string | string[],
    isOptional: boolean
  ) => {
    const newRequired = { ...requiredValues };
    const newOptional = { ...optionalValues };

    if (isOptional) {
      newOptional[nameKey] = val;
    } else {
      newRequired[nameKey] = val as string;
    }

    onChange({ required: newRequired, optional: newOptional });
  };

  if (
    parameter.type === "dictionary" &&
    parameter.restrictions?.multipleChoices
  ) {
    return (
      <MultipleSelect
        label={parameter.name}
        value={(optionalValues[nameKey] as string[]) || []}
        onChange={(vals) => handleParamChange(nameKey, vals, true)}
        availableOptions={
          parameter.dictionary?.map((el) => ({
            name: el.value,
            value: el.value,
          })) || []
        }
      />
    );
  }

  if (parameter.type === "dictionary") {
    return (
      <SingleSelect
        label={parameter.name}
        value={current}
        onChange={(val) => handleParamChange(nameKey, val, false)}
        availableOptions={
          parameter.dictionary?.map((el) => ({
            name: el.value,
            value: el.value,
          })) || []
        }
      />
    );
  }

  if (parameter.type === "string" || parameter.type === "float") {
    return (
      <InputFormItem
        label={parameter.name}
        type={parameter.type === "string" ? "text" : "number"}
        value={current}
        onChange={(e) => handleParamChange(nameKey, e.target.value, false)}
      />
    );
  }

  return (
    <InputFormItem
      label={parameter.name}
      type="text"
      value={current}
      onChange={(e) => handleParamChange(nameKey, e.target.value, false)}
    />
  );
}
