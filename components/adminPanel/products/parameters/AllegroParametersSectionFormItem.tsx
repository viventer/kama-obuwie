import { AllegroProductParameter } from "@/server-actions/allegro/products";
import InputFormItem from "../../global/form/InputFormItem";
import MultipleSearchSelect from "../../global/form/MultipleSearchSelect";
import SingleSearchSelect from "../../global/form/SingleSearchSelect";

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
      <MultipleSearchSelect
        label={parameter.name}
        value={value as string[]}
        onChange={onChange}
        options={
          parameter.dictionary?.map((el) => ({
            label: el.value,
            value: el.value,
          })) || []
        }
      />
    );
  }

  if (parameter.type === "dictionary") {
    return (
      <SingleSearchSelect
        label={parameter.name}
        value={value as string}
        onChange={onChange}
        options={
          parameter.dictionary?.map((el) => ({
            label: el.value,
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
