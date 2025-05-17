import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChangeEventHandler } from "react";

export default function InputFormItem({
  label,
  type,
  value,
  onChange,
  placeholder,
  className,
}: {
  label: string;
  type: string;
  value: string | number | undefined;
  onChange: ChangeEventHandler<HTMLInputElement>;
  placeholder?: string;
  className?: string;
}) {
  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <Input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={className}
        />
      </FormControl>
    </FormItem>
  );
}
