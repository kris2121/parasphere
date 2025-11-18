'use client';

import { useState, FormEvent } from 'react';
import { BadgeCheck } from 'lucide-react'; // VERIFICATION BADGE
import type { LocationData } from './LiveMap';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (loc: LocationData) => void;
  defaultCenter?: [number, number];
};

export default function AddLocationModal({
  open,
  onClose,
  onCreate,
  defaultCenter,
}: Props) {
  if (!open) return null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<LocationData['type']>('HAUNTING');
  const [summary, setSummary] = useState('');
  const [address, setAddress] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [verified, setVerified] = useState(false); // NEW VERIFIED TOGGLE

  const [lng, setLng] = useState<number>(defaultCenter?.[0] ?? -2.5);
  const [lat, setLat] = useState<number>(defaultCenter?.[1] ?? 54.3);

  // Image preview
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
      setImageUrl(undefined);
      return;
    }
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const url = URL.createObjectURL(f);
    setImageUrl(url);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const loc: LocationData = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type,
      lat: Number(lat),
      lng: Number(lng),
      summary: summary.trim() || undefined,
      address: address.trim() || undefined,
      priceInfo: priceInfo.trim() || undefined,
      website: website.trim() || undefined,
      verified, // NEW FLAG
      imageUrl,
    };

    onCreate(loc);
    onClose();
  }

  return (
    <>
      {/* BACKDROP */}
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />

      {/* MODAL */}
      <div
        className="fixed left-1/2 top-1/2 z-[91] 
                   w-[92vw] max-w-xl -translate-x-1/2 -translate-y-1/2
                   rounded-xl border border-white/20 bg-neutral-950 p-5"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-white">

          {/* TITLE */}
          <h3 className="text-xl font-semibold flex items-center gap-2">
            Add Location
            {verified && <BadgeCheck size={18} className="text-white" />}
          </h3>

          {/* LOCATION NAME */}
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Location title"
            required
            className="w-full rounded-md border border-white/20 
                       bg-neutral-900 px-3 py-2 text-white"
          />

          {/* TYPE — CLEANED TO ONLY HAUNTING/EVENT/COLLAB */}
          <select
            value={type}
            onChange={(e) =>
              setType(e.target.value as LocationData['type'])
            }
            className="w-full rounded-md border border-white/20
                       bg-neutral-900 px-3 py-2 text-white"
          >
            <option value="HAUNTING">Haunting</option>
            <option value="EVENT">Event</option>
            <option value="COLLAB">Collaboration</option>
          </select>

          {/* SUMMARY WITH PLACEHOLDER INCLUDING DATE/TIME INSTRUCTIONS */}
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Enter details, history, date/time if relevant, and any important information…"
            className="w-full rounded-md border border-white/20 
                       bg-neutral-900 px-3 py-2 text-white h-28"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2"
          />

          <input
            value={priceInfo}
            onChange={(e) => setPriceInfo(e.target.value)}
            placeholder="Price / entry fee (optional)"
            className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2"
          />

          <input
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="Website / booking link (optional)"
            className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2"
          />

          {/* VERIFIED TOGGLE */}
          <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
            <input
              type="checkbox"
              checked={verified}
              onChange={(e) => setVerified(e.target.checked)}
              className="h-4 w-4 accent-white"
            />
            Verified by Owner
            {verified && <BadgeCheck size={16} className="text-white" />}
          </label>

          {/* COORDS */}
          <div className="grid grid-cols-2 gap-3">
            <input
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              placeholder="Longitude"
              className="rounded-md border border-white/20 
                         bg-neutral-900 px-3 py-2 text-white"
            />
            <input
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              placeholder="Latitude"
              className="rounded-md border border-white/20 
                         bg-neutral-900 px-3 py-2 text-white"
            />
          </div>

          {/* IMAGE UPLOADER */}
          <div>
            <div className="text-sm mb-1 text-neutral-300">Main photo (optional)</div>
            <input
              type="file"
              accept="image/*"
              onChange={onImageChange}
              className="w-full rounded-md border border-white/20 bg-neutral-900 px-3 py-2"
            />

            {imageUrl && (
              <div className="mt-2 rounded-md border border-white/10 p-2">
                <img
                  src={imageUrl}
                  alt="preview"
                  className="w-auto max-h-64 rounded-md border border-white/10"
                />
              </div>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-white/20
                         px-3 py-1.5 hover:bg-white/10"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-white/40 bg-white/10
                         px-3 py-1.5 text-white hover:bg-white/20"
            >
              Save Location
            </button>
          </div>
        </form>
      </div>
    </>
  );
}


