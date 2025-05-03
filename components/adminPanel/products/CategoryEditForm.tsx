"use client";

import {
  CategoryWithId,
  RootCategoryValues,
} from "@/firebase/schemas/products";
import { useToast } from "@/hooks/useToast";
import { updateCategory } from "@/server-actions/products/categories";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import SubpageHeading from "../global/SubpageHeading";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllegroCategories,
  SerializedAllegroCategory,
} from "@/server-actions/allegro/categories";
import { Button } from "@/components/ui/button";

export default function CategoryEditForm({
  oldData,
}: {
  oldData: CategoryWithId;
}) {
  const [allegroCategories, setAllegroCategories] = useState<
    SerializedAllegroCategory[]
  >([]);

  const form = useForm<CategoryWithId>({
    defaultValues: {
      name: oldData.name || "",
      rootCategory: oldData.rootCategory || "obuwie męskie",
      allegroCategoryId: oldData.allegroCategoryId || "wybierz",
      variantParameters: oldData.variantParameters || [],
    },
  });

  const selectedRootCategory = form.watch("rootCategory");

  useEffect(() => {
    (async function () {
      const resp = await getAllegroCategories(
        selectedRootCategory || "obuwie męskie"
      );
      setAllegroCategories(resp);
    })();
  }, [selectedRootCategory]);

  const params = useParams() as { id: string };
  const { id } = params;

  const { showToast } = useToast();
  const router = useRouter();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const data = form.getValues();
    try {
      await updateCategory(id, data);
      showToast("Kategoria została zaktualizowana.", "success");
      router.push("/admin-panel/categories");
    } catch (err) {
      showToast(`Błąd aktualizacji kategorii: ${err}`, "error");
    }
  };

  return (
    <div className="w-full max-w-lg">
      <SubpageHeading text="Edytuj kategorię" />
      <Form {...form}>
        <div className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormLabel>Nazwa</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="rootCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategoria główna</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue="obuwie męskie"
                >
                  <FormControl>
                    <SelectTrigger className="text-base border-primary ">
                      <SelectValue className="text-base z-50" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-primary">
                    {RootCategoryValues.map((rootCategory) => (
                      <SelectItem
                        key={rootCategory}
                        value={rootCategory}
                        className="text-base z-50"
                      >
                        {rootCategory}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allegroCategoryId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kategoria Allegro</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={
                    oldData.allegroCategoryId || allegroCategories[0]?.id
                  }
                >
                  <FormControl>
                    <SelectTrigger className="text-base border-primary ">
                      {allegroCategories.find(
                        (category) => category.id == field.value
                      ) ? (
                        <SelectValue className="text-base z-50" />
                      ) : (
                        <p>Wybierz</p>
                      )}
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-card border-primary">
                    {allegroCategories.map((allegroCategory) => (
                      <SelectItem
                        key={allegroCategory.id}
                        value={allegroCategory.id}
                        className="text-base z-50"
                      >
                        {allegroCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormItem>
            )}
          />

          <Button
            type="submit"
            variant="outline"
            className="mt-8 w-fit"
            onClick={(e) => handleSubmit(e)}
          >
            Zapisz
          </Button>
        </div>
      </Form>
    </div>
  );
}
