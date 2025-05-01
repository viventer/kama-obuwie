import { SizingTable } from "@/firebase/schemas/products";
import { getDocumentFromAdminDB } from "@/server-actions/helpers";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<SizingTable>("sizingTables", id);
  const { data } = result;
  if (!data) {
    notFound();
  }

  return {
    title: `Edytuj tabelę rozmiarów ${data.name}`,
  };
}

export default async function SizingTableEditPage(props: Props) {
  const { id } = await props.params;
  const result = await getDocumentFromAdminDB<SizingTable>("sizingTables", id);
  const { data, ref } = result;
  if (!data) {
    notFound();
  }

  return <div>{data.name}</div>;
}
