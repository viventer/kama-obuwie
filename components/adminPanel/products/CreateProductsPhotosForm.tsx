import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getColorVariantName } from "./helpers/productsHelpers";
import ProductImagesUploader from "./ProductImagesUploader";
import { Fragment } from "react";
import SubpageHeading from "../global/SubpageHeading";
import Image from "next/image";
import { getImageUrl } from "@/server-actions/images/images";

export default async function CreateProductsPhotosForm({
  productData,
}: {
  productData: ProductWithId;
}) {
  const { id, colorVariants, rawPhotos, samplePhoto, manufacturerCode } =
    productData;
  const samplePhotoUrl = await getImageUrl(samplePhoto as string);
  const folderPath = `products/raw-photos/obuwie/${id}`;

  return (
    <div>
      <SubpageHeading text={`Dodaj zdjęcia do produktu`} />
      {samplePhotoUrl && (
        <section className="mb-8">
          <Image
            src={samplePhotoUrl}
            alt="Zdjęcie poglądowe"
            width={500}
            height={500}
            className="w-[10rem] aspect-square object-contain bg-primary/15 border-primary border-[0.1rem] border-solid rounded-sm mb-2"
          />
          <p className="font-bold">{manufacturerCode}</p>
        </section>
      )}
      {colorVariants ? (
        colorVariants.map((variant, i) => (
          <Fragment key={i}>
            <h2 className="text-xl font-bold mb-4">
              Wariant kolorystyczny: {getColorVariantName(variant)}
            </h2>
            <ProductImagesUploader
              variant={variant}
              oldPhotos={rawPhotos || []}
              folderPath={`${folderPath}/${getColorVariantName(variant)}`}
            />
          </Fragment>
        ))
      ) : (
        <ProductImagesUploader
          oldPhotos={rawPhotos || []}
          folderPath={folderPath}
        />
      )}
    </div>
  );
}
