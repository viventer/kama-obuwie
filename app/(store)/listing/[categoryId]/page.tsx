import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import CategoryProductsListing from "@/components/store/listing/CategoryProductsListing";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { getCategoryDisplayName } from "@/helpers/categories";
import { getProductsListingData } from "@/server-actions/products/products";
import { notFound } from "next/navigation";

export const revalidate = 86400; // 24h (ISR)

export const dynamicParams = true;

export async function generateStaticParams() {
  const categories =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");
  return (categories ?? [])
    .filter((category) => Boolean(category.id))
    .map((category) => ({ categoryId: category.id }));
}

type Props = {
  params: Promise<{ categoryId: string }>;
};

export default async function Page({ params }: Props) {
  const { categoryId } = await params;
  if (!categoryId || typeof categoryId !== "string") {
    notFound();
  }

  const category = await getDocumentFromAdminDB<CategoryWithId>(
    "categories",
    categoryId
  );

  if (!category.data) {
    notFound();
  }

  const products = await getProductsListingData([categoryId]);
  const productsInCategory = products[categoryId];
  const filteredProducts = productsInCategory?.filter(
    (product) => product.isActive
  );

  return (
    <div className="w-fit 2xs:w-full mx-auto sm:mx-0 ">
      <SubpageHeading text={`${getCategoryDisplayName(category.data)}`} />
      <CategoryProductsListing productsFromCategory={filteredProducts} />
    </div>
  );
}
