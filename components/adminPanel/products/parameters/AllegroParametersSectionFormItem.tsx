import { AllegroProductParameter } from "@/server-actions/allegro/products";
import MultipleSelect from "../../global/form/MultipleSelect";
import SingleSelect from "../../global/form/SingleSelect";
import InputFormItem from "../../global/form/InputFormItem";

export default function AllegroParametersSectionFormItem({
  parameter,
  onChange,
  value,
}: {
  parameter: AllegroProductParameter;
  onChange: (...event: any[]) => void;
  value: string | number | boolean | string[] | number[];
}) {
  if (
    parameter.type === "dictionary" &&
    parameter.restrictions?.multipleChoices
  ) {
    return (
      <MultipleSelect
        label={parameter.name}
        value={value as string[]}
        onChange={onChange}
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
        value={value as string}
        onChange={onChange}
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
        value={value as string | number}
        onChange={onChange}
      />
    );
  }

  return (
    <InputFormItem
      label={parameter.name}
      type="text"
      value={value as string}
      onChange={onChange}
    />
  );
}
