import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getImageUrl } from "@/server-actions/images/images";
import Image from "next/image";
import { getColorVariantName } from "./helpers/productsHelpers";

export default async function ShortProductInfo({
  product,
}: {
  product: ProductWithId;
}) {
  const samplePhotoUrl = await getImageUrl(product.samplePhoto as string);
  const colorVariantsNames = product.colorVariants
    ? product.colorVariants
        .map((variant) => getColorVariantName(variant))
        .join(", ")
    : "";

  return (
    <div className="flex gap-4 mb-8 items-center sm:flex-row flex-col">
      <Image
        src={samplePhotoUrl || ""}
        alt=""
        width={200}
        height={200}
        className="bg-foreground/15 rounded-sm"
      />
      <section>
        {product.brand && (
          <p>
            <b>Marka:</b> {product.brand}
          </p>
        )}
        <p>
          <b>Kod producenta:</b> {product.manufacturerCode}
        </p>
        <p>
          <b>Cena zakupu:</b> {product.purchasePrice}
        </p>
        {product.suggestedPrice && (
          <p>
            <b>Cena sugerowana:</b> {product.suggestedPrice}
          </p>
        )}
        {colorVariantsNames && (
          <p>
            <b>Warianty:</b> {colorVariantsNames}
          </p>
        )}
      </section>
    </div>
  );
}
