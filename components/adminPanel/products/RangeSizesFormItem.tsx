import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FormItem, FormControl, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface RangeSizeString {
  from: string;
  to: string;
}

interface RangeSizesFormItemProps {
  value?: RangeSizeString[];
  onChange: (value: RangeSizeString[]) => void;
}

export default function RangeSizesFormItem({
  value = [],
  onChange,
}: RangeSizesFormItemProps) {
  const [rows, setRows] = useState<RangeSizeString[]>(
    value.length > 0 ? value : [{ from: "0", to: "0" }]
  );

  useEffect(() => {
    setRows(value.length > 0 ? value : [{ from: "0", to: "0" }]);
  }, [value]);

  const handleUpdate = (
    index: number,
    key: keyof RangeSizeString,
    raw: string
  ) => {
    const updated = rows.map((row, i) =>
      i === index ? { ...row, [key]: raw } : row
    );
    setRows(updated);
    onChange(updated);
  };

  const addRow = () => {
    const last = rows[rows.length - 1] || { from: "0", to: "0" };
    const newRow: RangeSizeString = {
      from: (parseInt(last.from, 10) + 1).toString(),
      to: (parseInt(last.to, 10) + 1).toString(),
    };
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
    <div className="max-w-md">
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
