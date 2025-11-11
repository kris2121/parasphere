'use client';

import { useState, FormEvent } from 'react';
import type { LocationData } from './LiveMap';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (loc: LocationData) => void; // create a map pin
  defaultCenter?: [number, number]; // [lng, lat]
};

export default function AddLocationModal({ open, onClose, onCreate, defaultCenter }: Props) {
  if (!open) return null;

  const [title, setTitle] = useState('');
  const [type, setType] = useState<LocationData['type']>('HAUNTING');
  const [summary, setSummary] = useState('');
  const [address, setAddress] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [lng, setLng] = useState<number>(defaultCenter?.[0] ?? -2.5);
  const [lat, setLat] = useState<number>(defaultCenter?.[1] ?? 54.3);

  // local preview image (optional)
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
      imageUrl, // local preview only; swap to Supabase storage later
    };
    onCreate(loc);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Location</h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Location title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <select
            value={type}
            onChange={(e) => setType(e.target.value as LocationData['type'])}
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="HAUNTING">Haunting</option>
            <option value="UFO">UFO</option>
            <option value="CRYPTID">Cryptid</option>
            <option value="EVENT">Event</option>
          </select>

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Short summary (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              placeholder="Lng"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
            <input
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              placeholder="Lat"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          {/* Optional event extras when type === EVENT */}
          {type === 'EVENT' && (
            <div className="rounded-md border border-neutral-800 bg-neutral-950 p-3 grid gap-2">
              <div className="text-xs text-neutral-400">Event details (optional)</div>
              <input
                value={priceInfo}
                onChange={(e) => setPriceInfo(e.target.value)}
                placeholder="Price (optional)"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
              <input
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                placeholder="Ticket / Info link (optional)"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          )}

          <div>
            <div className="text-sm text-neutral-300 mb-1">Main photo (optional)</div>
            <input type="file" accept="image/*" onChange={onImageChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
            {imageUrl && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1.5">
              Cancel
            </button>
            <button type="submit" className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20">
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}

