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

import type { MarketplaceItem, SocialLink } from '@/types/paraverse';

const MARKETPLACE_COLLECTION = 'marketplace';

type MarketplaceDoc = {
  kind: 'For Sale' | 'Wanted';
  title: string;
  description: string;
  imageUrl?: string;
  contactInfo?: string;
  webLink?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
  countryCode?: string;
  postalCode?: string;
  socialLinks?: SocialLink[];
};

export async function loadMarketplace(): Promise<MarketplaceItem[]> {
  const ref = collection(db, MARKETPLACE_COLLECTION);
  const q = query(ref, orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);

  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...(d.data() as any),
      } as MarketplaceItem),
  );
}

export async function createMarketplaceItem(
  data: MarketplaceDoc,
): Promise<MarketplaceItem> {
  const ref = collection(db, MARKETPLACE_COLLECTION);
  const docRef = await addDoc(ref, data);

  return {
    id: docRef.id,
    ...(data as any),
  } as MarketplaceItem;
}

export async function updateMarketplaceDoc(
  id: string,
  patch: Partial<MarketplaceDoc>,
): Promise<void> {
  const ref = doc(db, MARKETPLACE_COLLECTION, id);
  await updateDoc(ref, patch);
}

export async function deleteMarketplaceDoc(id: string): Promise<void> {
  const ref = doc(db, MARKETPLACE_COLLECTION, id);
  await deleteDoc(ref);
}

