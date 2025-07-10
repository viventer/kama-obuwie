"use client";

import {
  AllegroSizingTable,
  sizingAccuracyType,
  sizingAccuracyValues,
  SizingTable,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { useForm, useFieldArray } from "react-hook-form";
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
import { FormEvent } from "react";
import { updateSizingTable } from "@/server-actions/products/sizingTables";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/hooks/useToast";
import FormWrapper from "../../global/form/FormWrapper";
import SingleSelect from "../../global/form/SingleSelect";
import axios from "axios";

type FormValues = {
  name: string;
  insoleLengths: Array<{
    size: string;
    insoleLength: string;
  }>;
  sizingAccuracy: string;
};

export default function SizingTableEditForm({
  oldData,
}: {
  oldData: SizingTableWithId;
}) {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { showToast } = useToast();

  const form = useForm<FormValues>({
    defaultValues: {
      name: oldData.name,
      insoleLengths: oldData.insoleLengths.map((row) => ({
        size: row.size,
        insoleLength: String(row.insoleLength),
      })),
      sizingAccuracy: oldData.sizingAccuracy || "normalna",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "insoleLengths",
  });

  const addRow = (e: FormEvent) => {
    e.preventDefault();
    const values = form.getValues("insoleLengths");
    const lastRow = values[values.length - 1];
    const lastSize = lastRow ? String(lastRow.size) : "0";
    let newSize;
    if (lastSize.includes("-")) {
      const lastSizeNumbers = lastSize.split("-").map(Number);
      newSize = `${lastSizeNumbers[0] + 2}-${lastSizeNumbers[1] + 2}`;
    } else {
      newSize = String(Number(lastSize) + 1);
    }
    const lastInsole = lastRow ? Number(lastRow.insoleLength) : 0;
    append({
      size: newSize,
      insoleLength: String((lastInsole + 0.5).toFixed(2)),
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = form.getValues();

    const sizeFormatRegex = /^(\d{2}|\d{2}-\d{2})$/;
    const invalidSizes = data.insoleLengths.filter(
      (row) => !sizeFormatRegex.test(row.size)
    );

    if (invalidSizes.length > 0) {
      showToast(
        `Nieprawidłowy format rozmiarów: ${invalidSizes
          .map((row) => row.size)
          .join(", ")}. Użyj formatu "42" lub "31-32".`,
        "error"
      );
      return;
    }

    const payload = {
      name: data.name,
      insoleLengths: data.insoleLengths.map((row) => ({
        size: String(row.size),
        insoleLength: Number(row.insoleLength),
      })),
      sizingAccuracy: data.sizingAccuracy as sizingAccuracyType,
    };

    try {
      await updateSizingTable(id, payload);
      await postChangesToAllegro(payload);
      showToast("Tabela rozmiarów została zaktualizowana.", "success");
      router.push("/admin-panel/sizing-tables");
    } catch (err) {
      showToast(`Błąd aktualizacji tabeli rozmiarów: ${err}`, "error");
    }
  };

  const postChangesToAllegro = async (payload: SizingTable) => {
    const allegroSizingTable = getFormattedAllegroSizingTable(payload);

    try {
      if (!oldData.allegroId) {
        const resp = await axios.post(
          "/api/allegro/sizing-tables",
          allegroSizingTable
        );
        await updateSizingTable(id, {
          allegroId: resp.data.id,
        });
      } else {
        await axios.put(`/api/allegro/sizing-tables/${oldData.allegroId}`, {
          id: oldData.allegroId,
          ...allegroSizingTable,
        });
      }
    } catch (err) {
      showToast(
        `Błąd podczas aktualizacji tabeli rozmiarów na Allegro: ${err}`,
        "error"
      );
    }
  };

  const getFormattedAllegroSizingTable = (
    payload: SizingTable
  ): Omit<AllegroSizingTable, "template"> => {
    return {
      name: payload.name,
      headers: [{ name: "długość wkładki (cm)" }, { name: "rozmiar EU" }],
      values: payload.insoleLengths.map(({ size, insoleLength }) => ({
        cells: [insoleLength.toString(), size.toString()],
      })),
    };
  };

  return (
    <FormWrapper headingText="Edytuj tabelę rozmiarów">
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
          <FormField
            control={form.control}
            name="sizingAccuracy"
            render={({ field }) => (
              <SingleSelect
                label="Charakterystyka rozmiarówki"
                value={field.value}
                onChange={field.onChange}
                availableOptions={sizingAccuracyValues.map((value) => ({
                  name: value,
                  value: value,
                }))}
              />
            )}
          />

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rozmiar</TableHead>
                <TableHead>Długość wkładki</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fields.map((field, i) => (
                <TableRow key={field.id}>
                  <TableCell>
                    <FormField
                      control={form.control}
                      name={`insoleLengths.${i}.size`}
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              type="text"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value)}
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
                              onChange={(e) => field.onChange(e.target.value)}
                              className="border-none"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TableCell>

                  <TableCell>
                    <Button variant="ghost" size="sm" onClick={() => remove(i)}>
                      Usuń
                    </Button>
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
            onClick={handleSubmit}
          >
            Zapisz
          </Button>
        </div>
      </Form>
    </FormWrapper>
  );
}
