import ProductPage from "@/components/store/product/ProductPage";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import { getImagesUrls } from "@/server-actions/files/files";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Informacje o produkcie`,
  };
}

export default async function CategoryEditPage(props: Props) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const colorVariantName =
    typeof searchParams.colorVariantName === "string"
      ? searchParams.colorVariantName
      : undefined;

  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data || !data.editedPhotos || !data.categoryId) {
    notFound();
  }

  const images = data.editedPhotos;

  const imagesUrls: Record<string, string[]> = {};

  for (const image of images) {
    if (image.colorVariantName) {
      const colorVariantName = image.colorVariantName;

      if (!imagesUrls[colorVariantName]) {
        imagesUrls[colorVariantName] = [];
      }
    }
  }

  for (const colorVariantName of Object.keys(imagesUrls)) {
    const variantImages = images.filter(
      (image) => image.colorVariantName === colorVariantName
    );

    const filePaths = variantImages.map((image) => image.filePath);

    if (filePaths.length > 0) {
      const urls = await getImagesUrls(filePaths);
      if (urls) {
        imagesUrls[colorVariantName] = urls;
      }
    }
  }

  const { data: category } = (await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    data.categoryId
  )) as { data: CategoryWithId };

  console.log(data.offersIds);

  return (
    <ProductPage
      imagesUrls={imagesUrls}
      productData={data}
      category={category}
      initialColorVariantName={colorVariantName}
    />
  );
}
