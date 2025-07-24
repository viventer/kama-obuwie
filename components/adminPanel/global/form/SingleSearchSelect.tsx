import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { FormItem, FormLabel } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import IconButton from "../IconButton";
import { XIcon, ChevronsUpDown } from "lucide-react";

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
      <div className="flex items-center gap-2">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="justify-between w-full text-base bg-transparent border-primary focus-visible:border-secondary border hover:bg-primary/15 hover:cursor-pointer font-normal"
              >
                <span>{selectedLabel || placeholder}</span>
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
            </PopoverContent>
          </Popover>
        </div>
        <IconButton
          onClick={() => onChange("")}
          className="text-primary flex-shrink-0"
        >
          <XIcon className="size-6" />
        </IconButton>
      </div>
    </FormItem>
  );
}
