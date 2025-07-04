import SizingTableEditForm from "@/components/adminPanel/products/sizing-tables/SizingTableEditForm";
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import { getDocumentFromAdminDB } from "@/firebase/getters";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata() {
  return {
    title: `Edytuj tabelę rozmiarów`,
  };
}

export default async function SizingTableEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<SizingTableWithId>(
    "sizingTables",
    id
  );
  const { data } = result;
  if (!data) {
    notFound();
  }

  return <SizingTableEditForm oldData={data} />;
}
