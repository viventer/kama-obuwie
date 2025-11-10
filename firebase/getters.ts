"use server";

import { adminDB } from "@/firebase/firebaseAdmin";
import { DocumentDataWithRef } from "@/server-actions/errorHandlers";

export const getDocumentFromAdminDB = async function <T>(
  collection: string,
  id: string
): Promise<DocumentDataWithRef<T>> {
  const ref = adminDB.collection(collection).doc(id);
  const doc = await ref.get();

  if (!doc.exists) {
    return { data: null, ref };
  }
  return { data: { ...doc.data(), id: doc.id } as T, ref };
};

export const getDocumentsFromAdminDB = async function <T>(
  collection: string,
  queryFn?: (
    ref: FirebaseFirestore.CollectionReference
  ) => FirebaseFirestore.Query
): Promise<(T & { id: string })[] | null> {
  const colRef = adminDB.collection(collection);

  const ref: FirebaseFirestore.Query = queryFn ? queryFn(colRef) : colRef;

  const snapshot = await ref.get();
  if (snapshot.empty) {
    return null;
  }

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...(doc.data() as T),
  }));
};
