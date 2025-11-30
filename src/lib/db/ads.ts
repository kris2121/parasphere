// lib/db/ads.ts

import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

import { db } from '@/lib/firebase';

// 🔹 Single, simple placement key type used app-wide
export type AdPlacementKey = string;

export type AdFormat = 'native' | 'banner';

export type AdDB = {
  id: string;

  // Which slot this ad belongs to
  placementKey: AdPlacementKey;

  // Visual type: native card in feed, or banner (e.g. carousel item)
  format: AdFormat;

  // Who is paying or being promoted
  sponsorName?: string;

  // Content used by the UI
  title?: string;
  subtitle?: string;
  imageUrl?: string;   // hero image for banner or thumbnail for native card
  targetUrl?: string;  // click-through URL
  ctaLabel?: string;   // e.g. "Learn more", "Book now"

  // Control whether it shows
  isActive: boolean;
  priority: number; // higher = shown earlier

  // Optional schedule
  activeFrom?: Timestamp;
  activeTo?: Timestamp;

  // Audit fields
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

const ADS_COLLECTION = 'ads';

// -------------------------------------------------------------
// Load all *currently active* ads for a given placement.
// -------------------------------------------------------------
export async function loadActiveAdsForPlacement(
  placementKey: AdPlacementKey,
): Promise<AdDB[]> {
  const adsRef = collection(db, ADS_COLLECTION);
  const snapshot = await getDocs(adsRef);
  const now = Timestamp.now();

  const ads: AdDB[] = [];

  snapshot.forEach((docSnap) => {
    const data = docSnap.data() as any;

    // Filter by placement + active status
    if (data.placementKey !== placementKey) return;
    if (!data.isActive) return;

    const activeFrom = data.activeFrom as Timestamp | undefined;
    const activeTo = data.activeTo as Timestamp | undefined;

    // Optional schedule checks
    if (activeFrom && typeof activeFrom.toMillis === 'function') {
      if (activeFrom.toMillis() > now.toMillis()) return;
    }
    if (activeTo && typeof activeTo.toMillis === 'function') {
      if (activeTo.toMillis() < now.toMillis()) return;
    }

    ads.push({
      id: docSnap.id,
      placementKey: data.placementKey,
      format: data.format,
      sponsorName: data.sponsorName,
      title: data.title,
      subtitle: data.subtitle,
      imageUrl: data.imageUrl,
      targetUrl: data.targetUrl,
      ctaLabel: data.ctaLabel,
      isActive: data.isActive,
      priority: data.priority ?? 0,
      activeFrom,
      activeTo,
      createdAt: data.createdAt ?? now,
      updatedAt: data.updatedAt ?? now,
    });
  });

  // Sort by priority (highest first)
  ads.sort((a, b) => (b.priority ?? 0) - (a.priority ?? 0));

  return ads;
}

// -------------------------------------------------------------
// Create a new ad document
// -------------------------------------------------------------
export async function createAd(
  partial: Partial<AdDB> & {
    placementKey: AdPlacementKey;
    format: AdFormat;
  },
) {
  const adsRef = collection(db, ADS_COLLECTION);
  const id = doc(adsRef).id;
  const now = Timestamp.now();

  const ad: AdDB = {
    id,
    placementKey: partial.placementKey,
    format: partial.format,
    sponsorName: partial.sponsorName ?? '',
    title: partial.title ?? '',
    subtitle: partial.subtitle ?? '',
    imageUrl: partial.imageUrl ?? '',
    targetUrl: partial.targetUrl ?? '',
    ctaLabel: partial.ctaLabel ?? '',
    isActive: partial.isActive ?? true,
    priority: partial.priority ?? 0,
    activeFrom: partial.activeFrom,
    activeTo: partial.activeTo,
    createdAt: now,
    updatedAt: now,
  };

  await setDoc(doc(adsRef, id), ad);
  return ad;
}

// -------------------------------------------------------------
// Update an existing ad document
// -------------------------------------------------------------
export async function updateAdDoc(
  id: string,
  updates: Partial<AdDB>,
) {
  const adRef = doc(db, ADS_COLLECTION, id);
  const payload = {
    ...updates,
    updatedAt: Timestamp.now(),
  };
  await updateDoc(adRef, payload);
}

// -------------------------------------------------------------
// Delete an ad document
// -------------------------------------------------------------
export async function deleteAdDoc(id: string) {
  const adRef = doc(db, ADS_COLLECTION, id);
  await deleteDoc(adRef);
}


