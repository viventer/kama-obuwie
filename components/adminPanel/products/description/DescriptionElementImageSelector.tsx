import { FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { EditedPhotoWithUrl } from "@/firebase/schemas/productsSchemas";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import SingleSelect from "../../global/form/SingleSelect";

export default function DescriptionElementImageSelector({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string | undefined;
}) {
  const form = useFormContext();
  const photos = form.watch("reorderedPhotos") as EditedPhotoWithUrl[];
  const firstVariantPhotos = photos.filter(
    (photo) => photo.colorVariantName === photos[0].colorVariantName
  );

  return (
    <FormItem className="w-full flex align-center justify-center max-w-full">
      <div className="w-fit flex flex-col justify-center gap-2">
        {firstVariantPhotos[Number(value) - 1]?.url ? (
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
          availableOptions={firstVariantPhotos.map((photo, index) => ({
            name: (index + 1).toString(),
            value: (index + 1).toString(),
          }))}
        />
      </div>
    </FormItem>
  );
}
