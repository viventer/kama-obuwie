import React, { useEffect, useState } from "react";
import { RangeSize } from "@/firebase/schemas/productsSchemas";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  FormField,
  FormItem,
  FormControl,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface RangeSizesFormItemProps {
  value?: RangeSize[];
  onChange: (value: RangeSize[]) => void;
}

export default function RangeSizesFormItem({
  value = [],
  onChange,
}: RangeSizesFormItemProps) {
  const [rows, setRows] = useState<RangeSize[]>(value);

  useEffect(() => {
    setRows(value);
  }, [value]);

  const handleUpdate = (index: number, key: keyof RangeSize, raw: string) => {
    const num = parseInt(raw, 10);
    if (isNaN(num)) return;
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [key]: num } : row
    );
    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const newRow: RangeSize = { from: 0, to: 0 };
    const updated = [...rows, newRow];
    setRows(updated);
    onChange(updated);
  };

  const removeRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    setRows(updated);
    onChange(updated);
  };

  return (
    <div>
      <FormLabel>Rozmiary zakresowe</FormLabel>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Lp.</TableHead>
            <TableHead>Od</TableHead>
            <TableHead>Do</TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{index + 1}</TableCell>

              <TableCell>
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      value={row.from}
                      onChange={(e) =>
                        handleUpdate(index, "from", e.target.value)
                      }
                      className="border-none w-full"
                    />
                  </FormControl>
                </FormItem>
              </TableCell>

              <TableCell>
                <FormItem>
                  <FormControl>
                    <Input
                      type="number"
                      value={row.to}
                      onChange={(e) =>
                        handleUpdate(index, "to", e.target.value)
                      }
                      className="border-none w-full"
                    />
                  </FormControl>
                </FormItem>
              </TableCell>

              <TableCell>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeRow(index)}
                >
                  Usuń
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Button onClick={addRow} className="mt-2">
        Dodaj zakres
      </Button>
    </div>
  );
}
