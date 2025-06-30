import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
import { useState } from "react";

type Option = {
  label: string;
  value: string;
};

type SingleSearchSelectProps = {
  label: string;
  value: string | undefined;
  options: Option[];
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function SingleSearchSelect({
  label,
  value,
  options,
  onChange,
  placeholder = "Wybierz",
}: SingleSearchSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabel = options.find((opt) => opt.value === value)?.label;

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <Select
        onValueChange={onChange}
        value={value}
        open={open}
        onOpenChange={setOpen}
      >
        <FormControl>
          <SelectTrigger className="text-base border-primary">
            {selectedLabel ? (
              <SelectValue className="text-base">{selectedLabel}</SelectValue>
            ) : (
              <SelectValue className="text-base" placeholder={placeholder} />
            )}
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          <Command>
            <CommandInput
              placeholder="Szukaj…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList>
              {filtered.length === 0 && (
                <CommandEmpty>Brak wyników wyszukiwania.</CommandEmpty>
              )}
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => {
                      onChange(opt.value);
                      setQuery("");
                      setOpen(false);
                    }}
                  >
                    {opt.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </SelectContent>
      </Select>
    </FormItem>
  );
}
