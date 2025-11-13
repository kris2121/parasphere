import { db } from "@/lib/firebase";
import {
  addDoc,
  collection,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Unsubscribe,
} from "firebase/firestore";

// Shape we’ll store in Firestore (very close to your LocationData)
export type NewLocation = {
  title: string;
  type: "HAUNTING" | "UFO" | "CRYPTID" | "EVENT";
  lat: number;
  lng: number;
  summary?: string;
  address?: string;
  priceInfo?: string;
  website?: string;
  imageUrl?: string;  // Image added back here
};

// Function to create a new location
export async function createLocation(data: NewLocation) {
  // Strip undefined so Firestore doesn't error
  const clean = Object.fromEntries(
    Object.entries(data).filter(([_, v]) => v !== undefined)
  );

  await addDoc(collection(db, "locations"), {
    ...clean,
    createdAt: serverTimestamp(),
  });
}

// Listen for location changes in Firestore
export function listenLocations(
  cb: (items: Array<{ id: string } & NewLocation>) => void
): Unsubscribe {
  const q = query(collection(db, "locations"), orderBy("createdAt", "desc"));
  return onSnapshot(q, (snap) => {
    cb(
      snap.docs.map((d) => {
        const v = d.data() as any;
        return {
          id: d.id,
          title: v.title,
          type: v.type,
          lat: v.lat,
          lng: v.lng,
          summary: v.summary,
          address: v.address,
          priceInfo: v.priceInfo,
          website: v.website,
          imageUrl: v.imageUrl, // Ensure the imageUrl is included in the data
        };
      })
    );
  });
}

