import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { Analytics, getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_ANALYTICS_MEASUREMENT_ID,
};

const app: FirebaseApp = !getApps().length
  ? initializeApp(firebaseConfig)
  : getApps()[0];

const db = getFirestore(app);

const auth = getAuth(app);
const googleAuthProvider = new GoogleAuthProvider();
googleAuthProvider.setCustomParameters({
  prompt: "select_account",
});
const storage = getStorage(app);
let analytics: Analytics | null = null;
if (typeof window !== "undefined") {
  analytics = getAnalytics(app);
}

export { db, app, storage, auth, googleAuthProvider, analytics };
