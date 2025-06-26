import {
  initializeApp,
  cert,
  getApps,
  ServiceAccount,
} from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

const {
  NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY,
  NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
  NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
} = process.env;

if (
  !NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
  !FIREBASE_PRIVATE_KEY ||
  !NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL ||
  !NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
) {
  console.log(
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID:",
    NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "FIREBASE_PRIVATE_KEY:",
    FIREBASE_PRIVATE_KEY,
    "NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL:",
    NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET:",
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
  );
  throw new Error(
    "Brakuje jednej lub więcej zmiennych środowiskowych Firebase!"
  );
}

const formattedPrivateKey = FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n");

const serviceAccount = {
  type: "service_account",
  project_id: NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  private_key: formattedPrivateKey,
  client_email: NEXT_PUBLIC_FIREBASE_CLIENT_EMAIL,
} as ServiceAccount;

const adminApp = !getApps().length
  ? initializeApp({
      credential: cert(serviceAccount),
      storageBucket: NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    })
  : getApps()[0];

const adminDB = getFirestore(adminApp);
const adminAuth = getAuth(adminApp);
const adminStorage = getStorage(adminApp);

export { adminApp, adminDB, adminAuth, adminStorage };
