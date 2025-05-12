import CreateProductsPhotosForm from "@/components/adminPanel/products/CreateProductsPhotosForm";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { getImageUrl } from "@/server-actions/images/images";
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
    <CreateProductsPhotosForm
      productData={data}
      samplePhotoUrl={samplePhotoUrl}
      creationStage="photos"
    />
  );
}
