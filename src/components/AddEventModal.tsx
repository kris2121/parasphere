'use client';

import { useState, FormEvent } from 'react';
import { LocationData } from '@/components/LiveMap';

type Props = {
  open: boolean;
  onClose: () => void;
  onCreateLocation: (loc: LocationData) => void; // creates an EVENT pin on the map
};

export default function AddEventModal({
  open,
  onClose,
  onCreateLocation,
}: Props) {
  if (!open) return null;

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [address, setAddress] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [website, setWebsite] = useState('');
  const [startISO, setStartISO] = useState('');
  const [endISO, setEndISO] = useState('');

  // basic coords; you can pass center in via props if you prefer
  const [lng, setLng] = useState(-2.5);
  const [lat, setLat] = useState(54.3);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    const loc: LocationData = {
      id: crypto.randomUUID(),
      title: title.trim(),
      type: 'EVENT',
      lat: Number(lat),
      lng: Number(lng),
      summary: summary || undefined,
      address: address || undefined,
      // NOTE:
      // startISO, endISO, priceInfo belong to the Event entity,
      // not the LocationData, so we do NOT include them here.
      website: website || undefined,
    };

    onCreateLocation(loc);
    onClose();
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <form onSubmit={handleSubmit} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Event (map pin)</h3>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Summary (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <input
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Address (optional)"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <div>
              <div className="mb-1 text-xs text-neutral-400">From</div>
              <input
                type="datetime-local"
                value={startISO}
                onChange={(e) => setStartISO(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
            <div>
              <div className="mb-1 text-xs text-neutral-400">To</div>
              <input
                type="datetime-local"
                value={endISO}
                onChange={(e) => setEndISO(e.target.value)}
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
              />
            </div>
          </div>

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

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-neutral-700 px-3 py-1.5"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-md border border-purple-400 bg-purple-500/10 px-3 py-1.5 text-purple-200 hover:bg-purple-500/20"
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </>
  );
}


