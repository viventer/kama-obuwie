import LongProductInfo from "@/components/adminPanel/assortment/LongProductInfo";
import ShortProductInfo from "@/components/adminPanel/assortment/ShortProductInfo";
import {
  CategoryWithId,
  EditedPhotoWithUrl,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { notFound } from "next/navigation";
import PhotosDownloadButton from "@/components/adminPanel/assortment/products/PhotosDownloadButton";
import PhotosReorder from "@/components/adminPanel/assortment/PhotosReorder";
import { getImagesUrls } from "@/server-actions/files/files";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Dane produktu`,
  };
}

export default async function ProductDataPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  const category = data.categoryId
    ? await getDocumentFromAdminDB<CategoryWithId>(
        "categories",
        data.categoryId || ""
      )
    : null;
  const allCategories =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");

  if (!allCategories) {
    notFound();
  }

  const matchingCategories = data?.matchingCategoriesIds?.map((categoryId) => {
    const foundCategory = allCategories.find((cat) => cat.id === categoryId);
    return foundCategory ? foundCategory.name : "";
  });

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
    <div className="flex flex-col gap-4">
      <ShortProductInfo product={data} />
      <div className="w-xl max-w-3xl">
        <PhotosReorder photos={photosWithUrls} readonly={true} />
      </div>
      <section className="flex gap-4 flex-wrap">
        <PhotosDownloadButton
          productType={data.productType}
          manufacturerCode={data.manufacturerCode}
          productId={data.id}
          imagesType="raw"
          className="mb-0"
        />
        <PhotosDownloadButton
          productType={data.productType}
          manufacturerCode={data.manufacturerCode}
          productId={data.id}
          imagesType="edited"
          className="bg-primary/70 hover:bg-primary/100 mb-4"
        />
      </section>
      <LongProductInfo
        product={data}
        category={category?.data || undefined}
        matchingCategories={matchingCategories}
      />
    </div>
  );
}
