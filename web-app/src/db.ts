import { get, onValue, ref, set, update, type Unsubscribe } from "firebase/database";
import { database } from "./firebase";

export type UserProfile = {
  uid: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
};

export async function createUserProfileIfMissing(uid: string): Promise<UserProfile> {
  const userRef = ref(database, `users/${uid}`);
  const snapshot = await get(userRef);

  if (snapshot.exists()) {
    return snapshot.val() as UserProfile;
  }

  const now = Date.now();
  const profile: UserProfile = {
    uid,
    displayName: "Anonymous",
    createdAt: now,
    updatedAt: now,
  };
  await set(userRef, profile);
  return profile;
}

export function subscribeToUserProfile(
  uid: string,
  callback: (profile: UserProfile | null) => void
): Unsubscribe {
  return onValue(ref(database, `users/${uid}`), (snapshot) => {
    callback(snapshot.exists() ? (snapshot.val() as UserProfile) : null);
  });
}

export async function saveDisplayName(uid: string, displayName: string): Promise<void> {
  await update(ref(database, `users/${uid}`), {
    uid,
    displayName: displayName.trim() || "Anonymous",
    updatedAt: Date.now(),
  });
}
