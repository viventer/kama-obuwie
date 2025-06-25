import FormWrapper from "@/components/adminPanel/global/form/FormWrapper";
import LinkText from "@/components/adminPanel/global/LinkText";
import PostOfferForm from "@/components/adminPanel/offers/PostOfferForm";
import ShortProductInfo from "@/components/adminPanel/products/ShortProductInfo";
import { Button } from "@/components/ui/button";
import { OfferWithId } from "@/firebase/schemas/offersSchemas";
import { ProductWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Wystaw ofertę`,
  };
}

export default async function CreateOfferPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<OfferWithId>("offers", id);
  const { data } = result;
  if (!data) {
    notFound();
  }
  const productId = data.productId;
  const productResult = await getDocumentFromAdminDB<ProductWithId>(
    "products",
    productId
  );
  const productData = productResult.data;
  if (!productData) {
    notFound();
  }

  return (
    <FormWrapper headingText="Wystaw ofertę">
      <ShortProductInfo product={productData} />
      <Button className="mb-4" asChild>
        <LinkText
          href={`/admin-panel/create-products/product-data/${productId}`}
        >
          Zobacz dane produktu
        </LinkText>
      </Button>
      <PostOfferForm oldOfferData={data} productData={productData} />
    </FormWrapper>
  );
}
