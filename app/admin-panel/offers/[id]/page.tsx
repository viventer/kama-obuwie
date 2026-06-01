import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { notFound } from "next/navigation";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import EditOfferForm from "@/components/adminPanel/offers/forms/EditOfferForm";
import OfferProductInfo from "@/components/adminPanel/offers/OfferProductInfo";
import { isValidUrl } from "@/components/adminPanel/offers/helpers/validation";
import { getImageUrl } from "@/server-actions/files/files";
import ShortProductInfo from "@/components/adminPanel/assortment/ShortProductInfo";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: "Edytuj ofertę",
  };
}

export default async function OfferEditPage(props: Props) {
  const { id } = await props.params;
  const offerResp = await getDocumentFromAdminDB<OfferWithId>("offers", id);
  const { data: oldData } = offerResp;
  if (!oldData) {
    notFound();
  }
  if (!oldData?.SKU) {
    notFound();
  }

  const thumbnailUrl = isValidUrl(oldData.thumbnail)
    ? oldData.thumbnail
    : await getImageUrl(oldData.thumbnail!);

  let productData: ProductWithId | null = null;
  if (oldData.productId) {
    const { data } = await getDocumentFromAdminDB<ProductWithId>(
      "products",
      oldData.productId as string,
    );
    if (data) {
      productData = data;
    }
  }

  return (
    <>
      <FormWrapper headingText="Edytuj ofertę">
        {productData ? (
          <ShortProductInfo product={productData} />
        ) : (
          <OfferProductInfo
            thumbnail={thumbnailUrl!}
            SKU={oldData.SKU}
            signature={oldData.signature}
            className="mb-4"
          />
        )}
        <EditOfferForm oldData={oldData} />
      </FormWrapper>
    </>
  );
}
