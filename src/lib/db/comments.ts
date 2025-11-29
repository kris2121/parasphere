// lib/db/comments.ts
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Comment schema we write to Firestore
export type CommentDB = {
  id: string;
  key: string;            // e.g. "post:123", "loc:456"
  text: string;
  authorId: string;
  authorName: string;
  parentId?: string | null;
  imageUrl?: string;
  tagUserIds?: string[];
  createdAt: number;
  updatedAt: number;
};

// Helper: remove undefined fields before writing to Firestore
function stripUndefined<T extends Record<string, any>>(obj: T): T {
  const clean: any = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v !== undefined) clean[k] = v;
  }
  return clean as T;
}

/* --------------------------------------------------
   Create Comment (includes normal comment & reply)
-------------------------------------------------- */
export async function createComment(data: CommentDB) {
  const clean = stripUndefined(data); // 🔥 no undefined imageUrl etc
  console.log('[Comments] createComment ->', clean);

  const ref = doc(collection(db, 'comments'), clean.id);
  await setDoc(ref, clean);
  return clean;
}

/* --------------------------------------------------
   Update Comment
-------------------------------------------------- */
export async function updateComment(id: string, patch: Partial<CommentDB>) {
  const clean = stripUndefined(patch);
  console.log('[Comments] updateComment ->', id, clean);

  const ref = doc(db, 'comments', id);
  await updateDoc(ref, {
    ...clean,
    updatedAt: Date.now(),
  });
}

/* --------------------------------------------------
   Delete Comment
-------------------------------------------------- */
export async function deleteCommentDoc(id: string) {
  console.log('[Comments] deleteCommentDoc ->', id);
  const ref = doc(db, 'comments', id);
  await deleteDoc(ref);
}

/* --------------------------------------------------
   Load all comments for a key (post, location, etc)
-------------------------------------------------- */
export async function loadCommentsByKey(key: string) {
  console.log('[Comments] loadCommentsByKey ->', key);

  const q = query(
    collection(db, 'comments'),
    where('key', '==', key),
  );

  const snap = await getDocs(q);
  const list: CommentDB[] = [];

  snap.forEach((d) => {
    const data = d.data() as CommentDB;
    list.push(data);
  });

  // sort client-side by createdAt
  list.sort((a, b) => a.createdAt - b.createdAt);

  console.log(
    '[Comments] loadCommentsByKey <-',
    key,
    'count =',
    list.length,
  );

  return list;
}

