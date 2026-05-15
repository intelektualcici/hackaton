import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, type Analytics } from "firebase/analytics";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFunctionsEmulator, getFunctions } from "firebase/functions";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const functions = getFunctions(app);
export const analyticsPromise: Promise<Analytics | null> = isSupported()
  .then((supported) => {
    if (!supported || !import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
      return null;
    }
    return getAnalytics(app);
  })
  .catch(() => null);

const emulatorState = globalThis as typeof globalThis & {
  __FIREBASE_EMULATORS_CONNECTED__?: boolean;
};

if (import.meta.env.VITE_USE_FIREBASE_EMULATORS === "true" && !emulatorState.__FIREBASE_EMULATORS_CONNECTED__) {
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectDatabaseEmulator(database, "127.0.0.1", 9000);
  connectFunctionsEmulator(functions, "127.0.0.1", 5001);
  emulatorState.__FIREBASE_EMULATORS_CONNECTED__ = true;
}
