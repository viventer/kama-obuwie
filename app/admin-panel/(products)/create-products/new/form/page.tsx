import ProductCreateForm from "@/components/adminPanel/products/create/ProductCreateForm";

export async function generateMetadata() {
  return {
    title: `Utwórz produkt`,
  };
}

export default async function ProductCreatePage() {
  return <ProductCreateForm />;
}
