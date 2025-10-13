import SubpageHeading from "@/components/adminPanel/global/SubpageHeading";
import ProductFromList from "@/components/store/home/ProductFromList";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { CategoryWithId } from "@/firebase/schemas/productsSchemas";
import { getProductsListingData } from "@/server-actions/products/products";
import { notFound } from "next/navigation";

type Props = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function page({ searchParams }: Props) {
  const categoryId = (await searchParams).categoryId;
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
      <SubpageHeading text={`${category.data.name}`} />
      <section className="grid gap-6 grid-cols- 2xs:grid-cols-[repeat(auto-fill,_minmax(10rem,_1fr))] lg:grid-cols-[repeat(auto-fill,_minmax(15rem,_1fr))]">
        {filteredProducts && filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <ProductFromList
              key={`${product.id}-${product.colorVariantName}`}
              product={product}
            />
          ))
        ) : (
          <div className="text-lg">Brak dostępnych produktów</div>
        )}
      </section>
    </div>
  );
}
