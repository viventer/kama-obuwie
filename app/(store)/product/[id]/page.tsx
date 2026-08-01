import ProductPage from "@/components/store/product/ProductPage";
import { notFound } from "next/navigation";
import { getStoreProductPageData } from "@/server-actions/store/getStoreProductPageData";
import { getDocumentsFromAdminDB } from "@/firebase/getters";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";

export const revalidate = 86400; // 24h (ISR)

export const dynamicParams = true;

export async function generateStaticParams() {
  const productsWithOffers =
    (await getDocumentsFromAdminDB<ProductWithId>("products", (ref) =>
      ref.where("offersIds", "!=", null),
    )) ?? [];

  const legacyOffers =
    (await getDocumentsFromAdminDB<OfferWithId>("offers", (ref) =>
      ref.where("legacyProductId", ">", ""),
    )) ?? [];

  return [...productsWithOffers, ...legacyOffers]
    .filter((entity) => Boolean(entity.id))
    .map((entity) => ({ id: entity.id }));
}

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata() {
  return {
    title: `Informacje o produkcie`,
  };
}

export default async function ProductDetails({ params }: Props) {
  const { id } = await params;
  if (!id || typeof id !== "string") {
    console.log("ID produktu jest nieprawidłowe:", id);
    notFound();
  }

  const pageData = await getStoreProductPageData({ id });
  if (!pageData) {
    console.log("brak danych dla produktu o ID:", id);
    notFound();
  }

  return (
    <ProductPage
      imagesUrls={pageData.imagesUrls}
      aiCoCreatedImageUrls={pageData.aiCoCreatedImageUrls}
      productData={pageData.productData}
      category={pageData.category}
      offersData={pageData.offersData}
      sizingTable={pageData.sizingTable}
      choosingSizeImageUrl={pageData.choosingSizeImageUrl}
      connectedOffers={pageData?.connectedOffers}
    />
  );
}
