import LongProductInfo from "@/components/adminPanel/products/LongProductInfo";
import ShortProductInfo from "@/components/adminPanel/products/ShortProductInfo";
import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { notFound } from "next/navigation";

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
  const allCategories = await getDocumentsFromAdminDB<CategoryWithId>(
    "categories"
  );

  if (!allCategories) {
    notFound();
  }

  const matchingCategories = data?.matchingCategoriesIds?.map((categoryId) => {
    const foundCategory = allCategories.find((cat) => cat.id === categoryId);
    return foundCategory ? foundCategory.name : "";
  });

  return (
    <div className="flex flex-col gap-4">
      <ShortProductInfo product={data} />
      <LongProductInfo
        product={data}
        category={category?.data || undefined}
        matchingCategories={matchingCategories}
      />
    </div>
  );
}
