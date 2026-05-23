import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import {
  ProductWithId,
  SizingTableWithId,
} from "@/firebase/schemas/productsSchemas";
import { notFound } from "next/navigation";

export default async function SizingTablesFix() {
  const products =
    await getDocumentsFromAdminDB<ProductWithId>("legacyProducts");
  const productsWithoutSizingTable = [];

  if (!products) notFound();

  for (const product of products) {
    if (!product.sizingTableId) {
      productsWithoutSizingTable.push(product);
      continue;
    }

    const { data: sizingTable } =
      await getDocumentFromAdminDB<SizingTableWithId>(
        "sizingTables",
        product.sizingTableId,
      );

    if (!sizingTable) {
      productsWithoutSizingTable.push(product);
    }
  }

  return productsWithoutSizingTable.map((product) => (
    <div key={product.id}>{product.manufacturerCode}</div>
  ));
}
