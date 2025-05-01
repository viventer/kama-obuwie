"use client";

import { SizingTable } from "@/firebase/schemas/products";
import SubpageHeading from "../global/SubpageHeading";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { FormEvent, useEffect, useState } from "react";
import { updateSizingTable } from "@/server-actions/products/sizingTables";
import { useParams } from "next/navigation";

export default function SizingTableEditForm({
  isNew,
  oldData,
}: {
  isNew: boolean;
  oldData: SizingTable;
}) {
  const params = useParams() as { id: string };
  const { id } = params;

  const text = isNew ? "Dodaj tabelę rozmiarów" : "Edytuj tabelę rozmiarów";
  const form = useForm<SizingTable>({
    defaultValues: {
      name: oldData.name || "",
      insoleLengths: oldData.insoleLengths.map((row) => ({
        size: row.size ?? 0,
        insoleLength: row.insoleLength ?? 0,
      })),
    },
  });

  const [newData, setNewData] = useState<SizingTable>(oldData);

  useEffect(() => {
    form.reset(newData);
  }, [newData, form]);

  const addRow = (e: FormEvent) => {
    e.preventDefault();
    const lastSize = newData.insoleLengths[newData.insoleLengths.length - 1];
    const newRow = {
      size: lastSize.size + 1,
      insoleLength: lastSize.insoleLength + 0.5,
    };
    setNewData((prev) => ({
      ...prev,
      insoleLengths: [...prev.insoleLengths, newRow],
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    const updatedData = {
      name: data.name,
      insoleLengths: data.insoleLengths,
    };
    console.log("Updated data:", id);
    await updateSizingTable(id, updatedData);
  };

  return (
    <>
      <SubpageHeading text={text} />
      <Form {...form}>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nazwa tabeli</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rozmiar</TableHead>
                <TableHead>Długość wkładki</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {form.getValues("insoleLengths").map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`insoleLengths.${i}.size`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="border-none"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`insoleLengths.${i}.insoleLength`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              className="border-none"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Button onClick={addRow} className="block">
            Dodaj nowy rozmiar
          </Button>

          <Button
            type="submit"
            variant="outline"
            className="mt-8 w-fit"
            onClick={(e) => handleSubmit(e)}
          >
            {isNew ? "Utwórz" : "Zapisz"}
          </Button>
        </div>
      </Form>
    </>
  );
}
