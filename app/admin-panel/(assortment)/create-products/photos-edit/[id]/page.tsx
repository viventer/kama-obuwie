import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import CreateProductsPhotosForm from "@/components/adminPanel/assortment/create-products/CreateProductsPhotosForm";
import { Button } from "@/components/ui/button";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { getImageUrl } from "@/server-actions/files/files";
import Image from "next/image";

import { notFound } from "next/navigation";
import axios from "axios";
import RawPhotosDownloadButton from "@/components/adminPanel/assortment/products/RawPhotosDownloadButton";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Dodaj edytowane zdjęcia produktu`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) notFound();

  let samplePhotoUrl: string | null = null;
  if (data.samplePhoto) {
    samplePhotoUrl = await getImageUrl(data.samplePhoto);
  }

  const folderPath = `products/raw-photos/${data.productType}/${data.id}`;
  const serializedManufacturerCode = data.manufacturerCode.replace(
    /[^a-zA-Z0-9]/g,
    "-"
  );
  const downloadName = `raw-${serializedManufacturerCode}`;
  const params = {
    folderPath,
    downloadName,
  };

  return (
    <FormWrapper headingText="Dodaj edytowane zdjęcia do produktu">
      {samplePhotoUrl && (
        <section className="mb-8">
          <Image
            src={samplePhotoUrl}
            alt="Zdjęcie poglądowe"
            width={500}
            height={500}
            className="w-[10rem] aspect-square object-contain bg-primary/15 border-primary border-[0.1rem] border-solid rounded-sm mb-2"
          />
          <p className="font-bold">{data.manufacturerCode}</p>
        </section>
      )}
      <RawPhotosDownloadButton params={params} />
      <CreateProductsPhotosForm productData={data} creationStage="photosEdit" />
    </FormWrapper>
  );
}
