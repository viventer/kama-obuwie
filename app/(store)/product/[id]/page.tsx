import ProductPage from "@/components/store/product/ProductPage";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import {
  CategoryWithId,
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { getImagesUrls, getImageUrl } from "@/server-actions/files/files";
import { notFound } from "next/navigation";
import { choosingSizeImageFilePath } from "@/lib/constants";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Informacje o produkcie`,
  };
}

export default async function ProductDetails(props: Props) {
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

  // Pobierz oferty dla wszystkich kolorów
  const offersData: Record<string, OfferWithId> = {};

  if (data.offersIds) {
    for (const [colorVariantName, offerId] of Object.entries(data.offersIds)) {
      const { data: offer } = await getDocumentFromAdminDB<OfferWithId>(
        "offers",
        offerId
      );
      if (offer) {
        offersData[colorVariantName] = offer;
      }
    }
  }

  // Pobierz tabelę rozmiarów jeśli istnieje
  let sizingTable: SizingTableWithId | undefined;
  if (data.sizingTableId) {
    const { data: sizingTableData } =
      await getDocumentFromAdminDB<SizingTableWithId>(
        "sizingTables",
        data.sizingTableId
      );
    if (sizingTableData) {
      sizingTable = sizingTableData;
    }
  }

  // Pobierz URL obrazka z instrukcją dobierania rozmiaru
  let choosingSizeImageUrl: string | undefined;
  try {
    const imageUrl = await getImageUrl(choosingSizeImageFilePath);
    choosingSizeImageUrl = imageUrl || undefined;
  } catch (error) {
    console.error("Błąd podczas pobierania obrazka z instrukcją:", error);
  }

  return (
    <ProductPage
      imagesUrls={imagesUrls}
      productData={data}
      category={category}
      initialColorVariantName={colorVariantName}
      offersData={offersData}
      sizingTable={sizingTable}
      choosingSizeImageUrl={choosingSizeImageUrl}
    />
  );
}
