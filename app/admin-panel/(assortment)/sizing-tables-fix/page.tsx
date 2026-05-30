import AddSizingTableButton from "@/components/adminPanel/assortment/products/AddSizingTableButton";
import {
  getDocumentFromAdminDB,
  getDocumentsFromAdminDB,
} from "@/firebase/getters";
import { LegacyProductWithId } from "@/firebase/schemas/legacyProductsSchemas";
import { SizingTableWithId } from "@/firebase/schemas/productsSchemas";
import Image from "next/image";
import { notFound } from "next/navigation";

export default async function SizingTablesFix() {
  const products =
    await getDocumentsFromAdminDB<LegacyProductWithId>("legacyProducts");
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

  return (
    <div className="flex flex-col gap-4">
      {productsWithoutSizingTable.map((product) => (
        <div key={product.id} className="flex items-center gap-4">
          <Image
            src={
              product?.imagesUrls?.[product?.colorVariantName || ""]?.[0] || ""
            }
            alt={product.manufacturerCode!}
            height={200}
            width={200}
          />
          <div>
            {product?.brand && <p>{product.brand}</p>}
            <p>{product.manufacturerCode}</p>
            <AddSizingTableButton productId={product.id} />
          </div>
        </div>
      ))}
    </div>
  );
}
