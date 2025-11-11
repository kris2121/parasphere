'use client';

import { useEffect, useState } from 'react';
import type { LocationData } from './LiveMap';

export default function AddEventModal({
  open,
  onClose,
  onSubmit,
  currentUserId,
  currentUserName,
  defaultCenter,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (ev: LocationData) => void; // we store events as LocationData with type === 'EVENT'
  currentUserId: string;
  currentUserName: string;
  defaultCenter?: { lat: number; lng: number };
}) {
  const [title, setTitle] = useState('');
  const [lat, setLat] = useState(defaultCenter?.lat ?? 54.3);
  const [lng, setLng] = useState(defaultCenter?.lng ?? -2.5);
  const [imageUrl, setImageUrl] = useState('');
  const [summary, setSummary] = useState('');
  const [address, setAddress] = useState('');
  const [startISO, setStartISO] = useState('');
  const [endISO, setEndISO] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [website, setWebsite] = useState('');

  useEffect(() => {
    if (!open) return;
    setTitle('');
    setLat(defaultCenter?.lat ?? 54.3);
    setLng(defaultCenter?.lng ?? -2.5);
    setImageUrl('');
    setSummary('');
    setAddress('');
    setStartISO('');
    setEndISO('');
    setPriceInfo('');
    setWebsite('');
  }, [open, defaultCenter]);

  if (!open) return null;

  function submit() {
    if (!title || !startISO) return;
    const ev: LocationData = {
      id: `ev_${crypto.randomUUID()}`,
      title,
      type: 'EVENT',
      lat, lng,
      imageUrl: imageUrl || undefined,
      summary: summary || undefined,
      address: address || undefined,
      eventStartISO: startISO,
      eventEndISO: endISO || undefined,
      priceInfo: priceInfo || undefined,
      website: website || undefined,
      uploader: { id: currentUserId, name: currentUserName },
      stars: 0,
      myStarred: false,
      comments: [],
    };
    onSubmit(ev);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="text-lg font-semibold mb-3">Add Event</h3>

        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Title</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={title} onChange={e=>setTitle(e.target.value)}
              placeholder="Overnight at Mill Street Barracks"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Price</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={priceInfo} onChange={e=>setPriceInfo(e.target.value)} placeholder="£35 pp"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Latitude</label>
            <input type="number" step="0.000001"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={lat} onChange={e=>setLat(parseFloat(e.target.value))}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Longitude</label>
            <input type="number" step="0.000001"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={lng} onChange={e=>setLng(parseFloat(e.target.value))}
            />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Main photo (URL)</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={imageUrl} onChange={e=>setImageUrl(e.target.value)} placeholder="https://…"
            />
          </div>
        </div>

        <div className="mt-3">
          <label className="block text-sm text-neutral-300 mb-1">Summary</label>
          <textarea
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm h-20"
            value={summary} onChange={e=>setSummary(e.target.value)}
            placeholder="What to expect, gear, rules, group size…"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Address</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={address} onChange={e=>setAddress(e.target.value)}
              placeholder="Street, Town, Postcode"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Tickets/Website</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={website} onChange={e=>setWebsite(e.target.value)}
              placeholder="https://…"
            />
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Starts</label>
            <input type="datetime-local"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={startISO} onChange={e=>setStartISO(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Ends (optional)</label>
            <input type="datetime-local"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={endISO} onChange={e=>setEndISO(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-600">
            Cancel
          </button>
          <button onClick={submit}
            className="rounded-md border border-cyan-600 bg-cyan-500/10 px-3 py-1 text-sm hover:bg-cyan-500/20">
            Add event
          </button>
        </div>
      </div>
    </div>
  );
}
