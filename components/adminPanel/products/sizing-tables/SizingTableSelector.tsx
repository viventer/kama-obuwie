import { FormControl, FormItem, FormLabel } from "@/components/ui/form";
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
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import { useEffect, useState } from "react";

export default function SizingTableSelector({
  onChange,
  value,
}: {
  onChange: (...event: any[]) => void;
  value: string | undefined;
}) {
  const { showToast } = useToast();
  const [allTables, setAllTables] = useState<SizingTableWithId[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get<SizingTableWithId[]>(
          `/api/sizing-tables`
        );
        setAllTables(Object.values(data));
      } catch (err) {
        showToast("Błąd pobierania tabel rozmiarów.", "error");
      }
    })();
  }, []);

  const filtered = allTables.filter((tbl) =>
    tbl.name.toLowerCase().includes(query.toLowerCase())
  );

  const selectedName = allTables.find((tbl) => tbl.id === value)?.name;

  return (
    <FormItem>
      <FormLabel>Tabela rozmiarów</FormLabel>
      <Select onValueChange={onChange} value={value}>
        <FormControl>
          <SelectTrigger className="text-base border-primary">
            {selectedName ? (
              <SelectValue className="text-base">{selectedName}</SelectValue>
            ) : (
              <SelectValue className="text-base" placeholder="Wybierz" />
            )}
          </SelectTrigger>
        </FormControl>

        <SelectContent>
          <Command>
            <CommandInput
              placeholder="Wyszukaj tabelę…"
              value={query}
              onValueChange={setQuery}
            />

            <CommandList>
              {filtered.length === 0 && (
                <CommandEmpty>Brak wyników wyszukiwania.</CommandEmpty>
              )}

              <CommandGroup>
                {filtered.map((tbl) => (
                  <CommandItem
                    key={tbl.id}
                    onSelect={(tableName) => {
                      const id = filtered.find(
                        (tbl) => tbl.name === tableName
                      )?.id;
                      onChange(id || "");
                      setQuery("");
                    }}
                  >
                    {tbl.name}
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
