"use client";

import { FormItem } from "@/components/ui/form";
import { EditedPhotoWithUrl } from "@/firebase/schemas/productsSchemas";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import SingleSelect from "../../global/form/SingleSelect";
import { useEffect, useState } from "react";
import { getImageUrl } from "@/server-actions/files/files";
import { choosingSizeImageFilePath } from "@/lib/constants";
import { useProductTypeContext } from "../ProductsTypeContext";

export default function DescriptionElementImageSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string | undefined;
}) {
  const { productType } = useProductTypeContext();

  const form = useFormContext();
  const photos = form.watch("reorderedPhotos") as EditedPhotoWithUrl[];
  const firstVariantPhotos = photos.filter(
    (photo) => photo.colorVariantName === photos[0].colorVariantName
  );
  const availableOptions = firstVariantPhotos.map((photo, index) => ({
    name: (index + 1).toString(),
    value: (index + 1).toString(),
  }));
  if (productType.includes("obuwie")) {
    availableOptions.push({ name: "Rozmiarówka", value: "rozmiarówka" });
  }
  const [choosingSizeUrl, setChoosingSizeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!productType.includes("obuwie")) return;

    (async () => {
      const url = await getImageUrl(choosingSizeImageFilePath);
      setChoosingSizeUrl(url);
    })();
  }, []);

  return (
    <FormItem className="w-full flex align-center justify-center max-w-full">
      <div className="w-fit flex flex-col justify-center gap-2">
        {value === "rozmiarówka" && choosingSizeUrl ? (
          <Image
            src={choosingSizeUrl}
            alt=""
            width="300"
            height="300"
            className="bg-primary/15 w-full rounded-sm object-contain aspect-auto"
          />
        ) : firstVariantPhotos[Number(value) - 1]?.url ? (
          <Image
            src={firstVariantPhotos[Number(value) - 1].url}
            alt=""
            width="300"
            height="300"
            className="bg-primary/15 w-full rounded-sm object-contain aspect-auto"
          />
        ) : (
          <ImageIcon className="size-48 text-primary" />
        )}
        <SingleSelect
          value={value}
          onChange={onChange}
          availableOptions={availableOptions}
        />
      </div>
    </FormItem>
  );
}
