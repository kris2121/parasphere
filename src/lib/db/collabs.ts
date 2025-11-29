import { db } from '@/lib/firebase';
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  updateDoc,
} from 'firebase/firestore';

import type { CollabItem } from '@/types/paraverse'; // if you don't have this type here yet, you can also export it from there

// keep it simple – minimal shape for Firestore
type SocialLink = {
  platform: string;
  url: string;
};

const COLLABS_COLLECTION = 'collaborations';

type CollabDoc = {
  title: string;
  description?: string;
  dateISO?: string;
  locationText?: string;
  priceText?: string;
  contact?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: { id: string; name: string; avatarUrl?: string };
  countryCode?: string;
  postalCode?: string;
  locationId?: string;
  socialLinks?: SocialLink[];
};

/**
 * Load all collabs (newest created first).
 * Sorting by date is still handled in the UI.
 */
export async function loadCollabs(): Promise<CollabItem[]> {
  const ref = collection(db, COLLABS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...(d.data() as any),
      } as CollabItem),
  );
}

/**
 * Create a new collab doc.
 */
export async function createCollab(
  data: CollabDoc,
): Promise<CollabItem> {
  const ref = collection(db, COLLABS_COLLECTION);
  const docRef = await addDoc(ref, data);

  return {
    id: docRef.id,
    ...(data as any),
  } as CollabItem;
}

/**
 * Update part of a collab doc.
 */
export async function updateCollabDoc(
  id: string,
  patch: Partial<CollabDoc>,
): Promise<void> {
  const ref = doc(db, COLLABS_COLLECTION, id);
  await updateDoc(ref, patch);
}

/**
 * Delete a collab doc.
 */
export async function deleteCollabDoc(id: string): Promise<void> {
  const ref = doc(db, COLLABS_COLLECTION, id);
  await deleteDoc(ref);
}
