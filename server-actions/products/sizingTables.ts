"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import {
  SizingTable,
  SizingTableSchema,
  SizingTableUpdateDataSchema,
} from "@/firebase/schemas/productsSchemas";
import { verifyUser } from "../auth/auth";

export const createSizingTable = async function (newSizingTable: SizingTable) {
  verifyUser(["ADMIN", "VERIFIED"]);
  SizingTableSchema.parse(newSizingTable);
  const sizingTableRef = adminDB.collection("sizingTables").doc();

  await sizingTableRef.set(newSizingTable);

  return sizingTableRef.id;
};

export const updateSizingTable = async function (
  id: string,
  updateData: Partial<SizingTable>
) {
  verifyUser(["ADMIN", "VERIFIED"]);
  SizingTableUpdateDataSchema.parse(updateData);
  const sizingTableRef = adminDB.collection("sizingTables").doc(id);
  const sizingTableDoc = await sizingTableRef.get();

  if (!sizingTableDoc.exists) {
    throw new Error("Tabela rozmiarów nie istnieje.");
  }

  await sizingTableRef.update(updateData);
};
