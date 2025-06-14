import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { useState } from "react";
import { cn, truncateString } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type MultipleSearchSelectProps = {
  label: string;
  value: string[];
  onChange: (values: string[]) => void;
  options: Option[];
  placeholder?: string;
};

export default function MultipleSearchSelect({
  label,
  value,
  onChange,
  options,
  placeholder = "Wybierz",
}: MultipleSearchSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const isSelected = (val: string) => value.includes(val);

  const toggleOption = (val: string) => {
    if (isSelected(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  const filtered = options.filter((opt) =>
    opt.label.toLowerCase().includes(query.toLowerCase())
  );

  const selectedLabels = options
    .filter((opt) => value.includes(opt.value))
    .map((opt) => opt.label);

  const buttonLabel =
    selectedLabels.length > 0
      ? truncateString(selectedLabels.join(", "), 42)
      : placeholder;

  return (
    <FormItem className="w-full">
      <FormLabel>{label}</FormLabel>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="justify-between w-full text-base bg-transparent border-input focus-visible:border-secondary border hover:bg-primary/15 hover:cursor-pointer font-normal"
          >
            <span>{buttonLabel}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] max-h-60 p-0 overflow-hidden">
          <Command className="max-h-60">
            <CommandInput
              placeholder="Szukaj…"
              value={query}
              onValueChange={setQuery}
            />
            <CommandList className="scrollbar overflow-auto">
              {filtered.length === 0 && (
                <CommandEmpty>Brak wyników wyszukiwania.</CommandEmpty>
              )}
              <CommandGroup>
                {filtered.map((opt) => (
                  <CommandItem
                    key={opt.value}
                    onSelect={() => toggleOption(opt.value)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      <Check
                        className={cn(
                          "h-4 w-4",
                          isSelected(opt.value) ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </FormItem>
  );
}
