import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CreateProductsPhotosForm from "@/components/adminPanel/products/CreateProductsPhotosForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { getImageUrl } from "@/server-actions/images/images";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Dodaj zdjęcia produktu`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  let samplePhotoUrl: string | null = null;
  if (data.samplePhoto) {
    samplePhotoUrl = await getImageUrl(data.samplePhoto);
  }

  return (
    <>
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
          <p className="font-bold">{data.manufacturerCode}</p>
        </section>
      )}
      <CreateProductsPhotosForm productData={data} creationStage="photos" />;
    </>
  );
}
