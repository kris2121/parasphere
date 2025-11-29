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

import type { DemoPost } from '@/types/paraverse';

const POSTS_COLLECTION = 'posts';

type PostDoc = {
  type: 'Post';
  title: string;
  desc: string;
  locationId?: string;
  imageUrl?: string;
  linkUrl?: string;
  linkKind?: DemoPost['linkKind'];
  authorId: string;
  authorName: string;
  tagUserIds?: string[];
  createdAt: number;
};

/**
 * Load all posts, newest first.
 */
export async function loadPosts(): Promise<DemoPost[]> {
  const ref = collection(db, POSTS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...(d.data() as any),
      } as DemoPost),
  );
}

/**
 * Create a new post doc.
 */
export async function createPost(data: PostDoc): Promise<DemoPost> {
  const ref = collection(db, POSTS_COLLECTION);
  const docRef = await addDoc(ref, data);

  return {
    id: docRef.id,
    ...(data as any),
  } as DemoPost;
}

/**
 * Update part of a post doc.
 */
export async function updatePostDoc(
  id: string,
  patch: Partial<PostDoc>,
): Promise<void> {
  const ref = doc(db, POSTS_COLLECTION, id);
  await updateDoc(ref, patch);
}

/**
 * Delete a post doc.
 */
export async function deletePostDoc(id: string): Promise<void> {
  const ref = doc(db, POSTS_COLLECTION, id);
  await deleteDoc(ref);
}
