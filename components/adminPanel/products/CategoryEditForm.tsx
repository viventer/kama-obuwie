"use client";

import { CategoryWithId } from "@/firebase/schemas/products";
import { useToast } from "@/hooks/useToast";
import { updateCategory } from "@/server-actions/products/categories";
import { useParams, useRouter } from "next/navigation";
import { FormEvent } from "react";
import { useForm } from "react-hook-form";

export default function CategoryEditForm({
  oldData,
}: {
  oldData: CategoryWithId;
}) {
  const params = useParams() as { id: string };
  const { id } = params;

  const { showToast } = useToast();
  const router = useRouter();

  const form = useForm<CategoryWithId>({
    defaultValues: {
      name: oldData.name || "",
      productType: oldData.productType || "",
      rootCategory: oldData.rootCategory || "",
      allegroCategoryId: oldData.allegroCategoryId || "",
      variantParameters: oldData.variantParameters || [],
    },
  });

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

  return <div>CategoryEditForm</div>;
}
