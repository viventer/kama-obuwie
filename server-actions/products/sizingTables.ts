"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  SizingTable,
  SizingTableSchema,
  SizingTableUpdateDataSchema,
} from "@/firebase/schemas/products";

export async function createSizingTable(newSizingTable: SizingTable) {
  SizingTableSchema.parse(newSizingTable);
  const sizingTableRef = adminDB.collection("sizingTables").doc();

  await sizingTableRef.set(newSizingTable);
}

export async function updateSizingTable(
  id: string,
  updateData: Partial<SizingTable>
) {
  SizingTableUpdateDataSchema.parse(updateData);
  const sizingTableRef = adminDB.collection("sizingTables").doc(id);
  const sizingTableDoc = await sizingTableRef.get();
  if (!sizingTableDoc.exists) {
    throw new Error("Tabela rozmiarów nie istnieje.");
  }

  await sizingTableRef.update(updateData);
}
