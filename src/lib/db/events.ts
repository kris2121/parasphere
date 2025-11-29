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

import type { EventItem, SocialLink } from '@/types/paraverse';

const EVENTS_COLLECTION = 'events';

type EventDoc = {
  title: string;
  description?: string;
  locationText?: string;
  startISO?: string;
  endISO?: string;
  priceText?: string;
  link?: string;
  imageUrl?: string;
  createdAt: number;
  postedBy: {
    id: string;
    name: string;
    avatarUrl?: string;
  };
  countryCode?: string;
  postalCode?: string;
  locationId?: string;
  socialLinks?: SocialLink[];
};

/**
 * Load all events, newest first.
 * (We can still filter by country in the UI, like you do now.)
 */
export async function loadEvents(): Promise<EventItem[]> {
  const ref = collection(db, EVENTS_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...(d.data() as any),
      } as EventItem),
  );
}

/**
 * Create a new event doc and return it with the generated id.
 */
export async function createEvent(data: EventDoc): Promise<EventItem> {
  const ref = collection(db, EVENTS_COLLECTION);
  const docRef = await addDoc(ref, data);

  return {
    id: docRef.id,
    ...(data as any),
  } as EventItem;
}

/**
 * Update part of an event doc.
 */
export async function updateEventDoc(
  id: string,
  patch: Partial<EventDoc>,
): Promise<void> {
  const ref = doc(db, EVENTS_COLLECTION, id);
  await updateDoc(ref, patch);
}

/**
 * Delete an event doc.
 */
export async function deleteEventDoc(id: string): Promise<void> {
  const ref = doc(db, EVENTS_COLLECTION, id);
  await deleteDoc(ref);
}
