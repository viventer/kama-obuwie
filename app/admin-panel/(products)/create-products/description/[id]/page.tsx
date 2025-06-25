import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import LinkText from "@/components/adminPanel/global/LinkText";
import { EditProductDescriptionForm } from "@/components/adminPanel/products/description/EditProductDescriptionForm";
import { Button } from "@/components/ui/button";
import {
  EditedPhotoWithUrl,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { getImagesUrls } from "@/server-actions/images/images";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Utwórz opis produktu`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  const filePaths = data?.editedPhotos?.map((photo) => photo.filePath);
  if (!data || !filePaths || !data.editedPhotos) {
    notFound();
  }

  const urls = await getImagesUrls(filePaths);

  if (!urls) {
    console.error("Failed to fetch image URLs");
    return null;
  }

  const photosWithUrls: EditedPhotoWithUrl[] = data.editedPhotos.map(
    (photo, idx) => ({
      ...photo,
      url: urls[idx],
    })
  );

  return (
    <FormWrapper headingText="Utwórz opis produktu">
      <Button className="mb-4" asChild>
        <LinkText href={`/admin-panel/create-products/product-data/${data.id}`}>
          Zobacz dane produktu
        </LinkText>
      </Button>
      <EditProductDescriptionForm
        oldDescription={data.description}
        oldPhotos={photosWithUrls}
      />
    </FormWrapper>
  );
}
