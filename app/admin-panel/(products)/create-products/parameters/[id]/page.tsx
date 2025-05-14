import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import EditProductParametersForm from "@/components/adminPanel/products/EditProductParametersForm";
import {
  CategoryWithId,
  ProductWithId,
} from "@/firebase/schemas/productsSchemas";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/server-actions/helpers";
import { getImageUrl } from "@/server-actions/images/images";
import Image from "next/image";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  return {
    title: `Uzupełnij parametry produktu`,
  };
}

export default async function ProductEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<ProductWithId>("products", id);
  const { data } = result;
  if (!data) {
    notFound();
  }
  const availableCategories: CategoryWithId[] | null =
    await getDocumentsFromAdminDB<CategoryWithId>("categories");

  const filteredCategories = availableCategories?.filter((category) => {
    if (data.productType === "akcesoria") {
      return category.rootCategory.includes("akcesoria");
    } else {
      return category.rootCategory.includes("obuwie");
    }
  });

  let samplePhotoUrl: string | null = null;
  if (data.samplePhoto) {
    samplePhotoUrl = await getImageUrl(data.samplePhoto);
  }

  return (
    <>
      <SubpageHeading text={`Uzupełnij parametry produktu`} />
      <EditProductParametersForm oldData={data} />
    </>
  );
}
