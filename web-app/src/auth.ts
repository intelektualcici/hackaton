import { onAuthStateChanged, signInAnonymously, type User } from "firebase/auth";
import { auth } from "./firebase";

export function listenToAuth(callback: (user: User | null) => void): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function signInAnonymousUser(): Promise<User> {
  const credential = await signInAnonymously(auth);
  return credential.user;
}
