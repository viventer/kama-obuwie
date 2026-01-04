import ProductPage from "@/components/store/product/ProductPage";
import { notFound } from "next/navigation";
import { getStoreProductPageData } from "@/server-actions/store/getStoreProductPageData";

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

  const pageData = await getStoreProductPageData({ id, colorVariantName });
  if (!pageData) {
    notFound();
  }

  return (
    <ProductPage
      imagesUrls={pageData.imagesUrls}
      productData={pageData.productData}
      category={pageData.category}
      initialColorVariantName={colorVariantName}
      offersData={pageData.offersData}
      sizingTable={pageData.sizingTable}
      choosingSizeImageUrl={pageData.choosingSizeImageUrl}
    />
  );
}
