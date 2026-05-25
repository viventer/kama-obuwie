"use client";

import { useDialogWindow } from "@/app/providers/DialogWindowProvider";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/useToast";
import axios from "axios";
import SizingTableSelector from "../sizing-tables/SizingTableSelector";
import { useForm } from "react-hook-form";
import { Form, FormField } from "@/components/ui/form";

export default function AddSizingTableButton({
  productId,
}: {
  productId: string;
}) {
  const { openDialog } = useDialogWindow();
  const { showToast } = useToast();

  const form = useForm({
    defaultValues: {
      sizingTableId: "",
    },
  });

  const addSizingTable = async (productId: string) => {
    openDialog({
      title: "Dodaj tabelę rozmiarów",
      content: (
        <div className="min-h-[500px]">
          <Form {...form}>
            <FormField
              control={form.control}
              name="sizingTableId"
              render={({ field }) => (
                <SizingTableSelector
                  onChange={field.onChange}
                  value={field.value}
                />
              )}
            />
          </Form>
        </div>
      ),
      onConfirm: async () => {
        const data = form.getValues();
        const sizingTableId = data.sizingTableId;

        try {
          await axios.patch(`/api/products/${productId}?isLegacy=true`, {
            sizingTableId,
          });
          showToast("Tabela rozmiarów została dodana.", "success");
        } catch (err) {
          console.error("Błąd podczas dodawania tabeli rozmiarów:", err);
          showToast("Nie udało się dodać tabeli rozmiarów.", "error");
        }
      },
    });
  };

  return (
    <Button onClick={() => addSizingTable(productId)}>
      Dodaj tabelę rozmiarów
    </Button>
  );
}
