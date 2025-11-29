import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  updateDoc,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';

import type { LocationData } from '@/components/LiveMap';
import type { SocialLink } from '@/types/paraverse';


// Shape of the data we send when creating/updating a location
export type LocationCreateInput = {
  title: string;
  type: LocationData['type'];
  lat: number;
  lng: number;
  summary?: string;
  address?: string;
  website?: string;
  imageUrl?: string;
  verifiedByOwner?: boolean;
  countryCode: string;
  postalCode: string;
  ownerId: string;
  ownerName: string;
  socialLinks?: SocialLink[];
};

/**
 * Helper: remove undefined fields so Firestore doesn't choke.
 */
function stripUndefined<T extends Record<string, any>>(obj: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  ) as Partial<T>;
}
async function uploadLocationImageToStorage(file: File, locationId: string) {
  const ext = file.name.split('.').pop() || 'jpg';
  const path = `locations/${locationId}.${ext}`;

  const fileRef = storageRef(storage, path);
  await uploadBytes(fileRef, file);

  const url = await getDownloadURL(fileRef);
  return url;
}

/**
 * Convert Firestore doc -> LocationData
 */
function docToLocation(
  id: string,
  data: any,
): LocationData {
  return {
    id,
    title: data.title ?? 'Untitled location',
    type: data.type ?? 'HAUNTING',
    lat: data.lat ?? 0,
    lng: data.lng ?? 0,
    summary: data.summary,
    address: data.address,
    website: data.website,
    imageUrl: data.imageUrl,          // <- ensure we read imageUrl
    verifiedByOwner: !!data.verifiedByOwner,
    countryCode: data.countryCode ?? 'GB',
    postalCode: data.postalCode ?? '',
    ownerId: data.ownerId,
    ownerName: data.ownerName,
    createdAt: data.createdAt ?? Date.now(),
    socialLinks: data.socialLinks ?? [],
  } as LocationData;
}

/**
 * Load locations, optionally scoped by country code.
 */
export async function loadLocations(
  country?: string | null,
): Promise<LocationData[]> {
  const colRef = collection(db, 'locations');

  let q;

  // If we have a specific country (GB/US/etc) and it's not "EU",
  // just filter by countryCode. No orderBy => no composite index needed.
  if (country && country.toUpperCase() !== 'EU') {
    q = query(
      colRef,
      where('countryCode', '==', country.toUpperCase()),
    );
  } else {
    // Global / EU view – order by createdAt
    q = query(colRef, orderBy('createdAt', 'desc'));
  }

  const snap = await getDocs(q);
  const out: LocationData[] = [];

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    out.push(docToLocation(docSnap.id, data));
  });

  return out;
}

/**
 * Create a new location in Firestore and return full LocationData.
 */
export async function createLocation(
  input: LocationCreateInput,
): Promise<LocationData> {
  const colRef = collection(db, 'locations');

  const payload = {
    ...stripUndefined(input),
    createdAt: Date.now(),
  };

  const ref = await addDoc(colRef, payload);

  return docToLocation(ref.id, payload);
}
export async function createLocationWithImage(
  input: LocationCreateInput,
  imageFile?: File | null,
): Promise<LocationData> {
  const colRef = collection(db, 'locations');

  // Do NOT put imageUrl in the first write
  const payload = {
    ...stripUndefined({
      ...input,
      imageUrl: undefined,
    }),
    createdAt: Date.now(),
  };

  // 1) Create document first to get ID
  const ref = await addDoc(colRef, payload);

  let finalImageUrl: string | undefined;

  // 2) If we have an image file, upload to Storage and then patch doc
  if (imageFile) {
    finalImageUrl = await uploadLocationImageToStorage(imageFile, ref.id);
    await updateDoc(ref, { imageUrl: finalImageUrl });
  }

  // 3) Return full LocationData, including imageUrl if we set it
  return docToLocation(ref.id, {
    ...payload,
    imageUrl: finalImageUrl,
  });
}

/**
 * Update an existing location by ID.
 */
export async function updateLocation(
  id: string,
  patch: Partial<LocationCreateInput>,
): Promise<void> {
  const docRef = doc(db, 'locations', id);
  const cleanPatch = stripUndefined(patch);

  await updateDoc(docRef, cleanPatch as any);
}

/**
 * Delete a location document by ID.
 */
export async function deleteLocationDoc(id: string): Promise<void> {
  const docRef = doc(db, 'locations', id);
  await deleteDoc(docRef);
}

