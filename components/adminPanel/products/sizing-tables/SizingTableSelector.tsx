import { useEffect, useState } from "react";
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import SingleSearchSelect from "../../global/form/SingleSearchSelect";

export default function SizingTableSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string | undefined;
}) {
  const { showToast } = useToast();
  const [allTables, setAllTables] = useState<SizingTableWithId[]>([]);

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

  const options = allTables.map((tbl) => ({
    label: tbl.name,
    value: tbl.id,
  }));

  return (
    <SingleSearchSelect
      label="Tabela rozmiarów"
      value={value}
      onChange={onChange}
      options={options}
    />
  );
}
