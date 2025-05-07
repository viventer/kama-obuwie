import ProductCreateForm from "@/components/adminPanel/products/ProductCreateForm";

export async function generateMetadata() {
  return {
    title: `Utwórz produkt`,
  };
}

export default async function ProductCreatePage() {
  return <ProductCreateForm />;
}
