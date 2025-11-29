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

import type { CreatorPost } from '@/components/feed/CreatorsFeed';

const CREATORS_COLLECTION = 'creatorPosts';

type CreatorDoc = {
  title: string;
  description?: string;
  youtubeUrl: string;
  locationId: string;
  locationText: string;
  createdAt: number;
  postedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
};

/** Load all creator posts, newest first */
export async function loadCreatorPosts(): Promise<CreatorPost[]> {
  const ref = collection(db, CREATORS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...(d.data() as any),
      } as CreatorPost),
  );
}

/** Create a new creator post */
export async function createCreatorPostDoc(
  data: CreatorDoc,
): Promise<CreatorPost> {
  const ref = collection(db, CREATORS_COLLECTION);
  const docRef = await addDoc(ref, data);

  return {
    id: docRef.id,
    ...(data as any),
  } as CreatorPost;
}

/** Update part of a creator post */
export async function updateCreatorPostDoc(
  id: string,
  patch: Partial<CreatorDoc>,
): Promise<void> {
  const ref = doc(db, CREATORS_COLLECTION, id);
  await updateDoc(ref, patch);
}

/** Delete a creator post */
export async function deleteCreatorPostDoc(id: string): Promise<void> {
  const ref = doc(db, CREATORS_COLLECTION, id);
  await deleteDoc(ref);
}
