// src/lib/db/users.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export type UserDB = {
  id: string;
  name: string;
  bio?: string | null;
  country?: string | null;
  avatarUrl?: string | null;
  socialLinks?: Array<{
    platform: string;
    url: string;
  }>;
  createdAt?: number;
  updatedAt?: number;
};

// small helper to strip undefined so Firestore doesn’t complain
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  const entries = Object.entries(obj).filter(([, v]) => v !== undefined);
  return Object.fromEntries(entries) as Partial<T>;
}

/**
 * Create a brand new user document.
 */
export async function createUser(
  data: UserDB | Omit<UserDB, 'createdAt' | 'updatedAt'>
) {
  const ref = doc(collection(db, 'users'), data.id);

  const payload: UserDB = {
    ...data,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as UserDB;

  await setDoc(ref, stripUndefined(payload));
  return payload;
}

/**
 * Upsert user document: if it exists, update; if it doesn't, create it.
 */
export async function updateUserDoc(
  id: string,
  patch: Partial<UserDB>,
) {
  const ref = doc(db, 'users', id);

  const payload: Partial<UserDB> = {
    ...patch,
    updatedAt: Date.now(),
  };

  // ⬇️ This works whether the doc exists or not
  await setDoc(ref, stripUndefined(payload), { merge: true });
}

/**
 * Optional helper: load a user by id.
 */
export async function loadUser(id: string): Promise<UserDB | null> {
  const ref = doc(db, 'users', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as any) } as UserDB;
}



