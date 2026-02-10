import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import CreateProductsPhotosForm from "@/components/adminPanel/assortment/create-products/CreateProductsPhotosForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { getImageUrl } from "@/server-actions/files/files";
import Image from "next/image";

import { notFound } from "next/navigation";
import PhotosDownloadButton from "@/components/adminPanel/assortment/products/PhotosDownloadButton";

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

  return (
    <FormWrapper headingText="Dodaj edytowane zdjęcia do produktu">
      {samplePhotoUrl && (
        <section className="mb-8">
          <Image
            src={samplePhotoUrl}
            alt="Zdjęcie poglądowe"
            width={500}
            height={500}
            className="w-[10rem] aspect-square object-contain bg-primary/15 border-primary border-[0.1rem] border-solid rounded-xs mb-2"
          />
          <p className="font-bold">{data.manufacturerCode}</p>
        </section>
      )}
      <PhotosDownloadButton
        productType={data.productType}
        manufacturerCode={data.manufacturerCode}
        productId={data.id}
        imagesType="raw"
        className="mb-8"
      />
      <CreateProductsPhotosForm productData={data} creationStage="photosEdit" />
    </FormWrapper>
  );
}
