import { ColorVariant, RawPhoto } from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "./helpers/productsHelpers";

export default function ProductImagesUploader({
  variant,
  oldPhotos,
}: {
  variant?: ColorVariant;
  oldPhotos: RawPhoto[];
}) {
  return <div>ProductImagesUploader</div>;
}
