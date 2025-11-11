'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LocationData } from './LiveMap';

type ListingType = 'For Sale' | 'Wanted' | 'Service';

export default function AddListingModal({
  open,
  onClose,
  onSubmit,
  locations,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: ListingType;
    title: string;
    description: string;
    price?: number;
    condition?: string;     // for Sale / optional for others
    imageDataUrl?: string;  // preview image stored as data URL (demo)
    contactText?: string;   // displayed text (email/phone/URL)
    contactLink?: string;   // href (mailto:, tel:, https://)
    locationId?: string;    // optional mapping to a pin
  }) => void;
  locations: LocationData[];
}) {
  const [type, setType] = useState<ListingType>('For Sale');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState<string>('');
  const [condition, setCondition] = useState('');
  const [imageDataUrl, setImageDataUrl] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [contactText, setContactText] = useState('');
  const [contactLink, setContactLink] = useState('');
  const [locationId, setLocationId] = useState<string>('');

  useEffect(() => {
    if (!open) return;
    setType('For Sale');
    setTitle(''); setDescription(''); setPrice(''); setCondition('');
    setImageDataUrl(''); setImageUrl('');
    setContactText(''); setContactLink('');
    setLocationId('');
  }, [open]);

  // Convert a selected file to data URL for easy demo preview/storage
  function onPickFile(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ''));
    reader.readAsDataURL(file);
  }

  // Use pasted/typed image URL if no file chosen
  useEffect(() => {
    if (imageUrl && !imageDataUrl) setImageDataUrl(imageUrl);
  }, [imageUrl, imageDataUrl]);

  const allowPrice = useMemo(() => type !== 'Wanted' && type !== 'Service' ? true : type === 'For Sale', [type]);

  function submit() {
    if (!title.trim()) return;
    onSubmit({
      type,
      title: title.trim(),
      description: description.trim(),
      price: price ? Number(price) : undefined,
      condition: condition.trim() || undefined,
      imageDataUrl: imageDataUrl || undefined,
      contactText: contactText.trim() || undefined,
      contactLink: contactLink.trim() || undefined,
      locationId: locationId || undefined,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="text-lg font-semibold mb-3">Add Marketplace Listing</h3>

        {/* Type */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Type</label>
            <select
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
            >
              <option>For Sale</option>
              <option>Wanted</option>
              <option>Service</option>
            </select>
          </div>

          {/* Price (For Sale optional; Services often by quote so optional) */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Price (optional)</label>
            <input
              type="number"
              min="0" step="1" inputMode="numeric"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              placeholder={type === 'Service' ? 'e.g., hourly rate or leave blank' : 'e.g., 120'}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
            />
          </div>

          {/* Attach to location (optional) */}
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Attach to location (optional)</label>
            <select
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={locationId}
              onChange={(e) => setLocationId(e.target.value)}
            >
              <option value="">— none —</option>
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Title */}
        <div className="mt-3">
          <label className="block text-sm text-neutral-300 mb-1">Title</label>
          <input
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
            value={title} onChange={(e)=>setTitle(e.target.value)}
            placeholder={type === 'Service' ? "e.g., Paranormal video editing services" : "e.g., SB7 Spirit Box — boxed"}
          />
        </div>

        {/* Description */}
        <div className="mt-3">
          <label className="block text-sm text-neutral-300 mb-1">Description</label>
          <textarea
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm h-24"
            value={description} onChange={(e)=>setDescription(e.target.value)}
            placeholder={type === 'Service'
              ? "Describe your service, turnaround, portfolio link, regions covered, etc."
              : "Condition, what's included, shipping/collection, other details…"}
          />
        </div>

        {/* Condition (mainly for For Sale) */}
        <div className="mt-3">
          <label className="block text-sm text-neutral-300 mb-1">Condition / Extra details (optional)</label>
          <input
            className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
            value={condition} onChange={(e)=>setCondition(e.target.value)}
            placeholder={type === 'Service' ? "e.g., Category (Video Editing / Photography / Merch Printing)" : "e.g., Excellent • Boxed"}
          />
        </div>

        {/* Image */}
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Image URL (optional)</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={imageUrl} onChange={(e)=>setImageUrl(e.target.value)} placeholder="https://…"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Or upload photo</label>
            <input
              type="file" accept="image/*"
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              onChange={(e)=>onPickFile(e.target.files?.[0] ?? null)}
            />
          </div>
        </div>
        {imageDataUrl && (
          <div className="mt-2">
            <img src={imageDataUrl} alt="" className="max-h-48 rounded-md border border-neutral-800 object-cover" />
          </div>
        )}

        {/* Contact */}
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Contact (displayed)</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={contactText} onChange={(e)=>setContactText(e.target.value)} placeholder="e.g., andy@example.com / @handle / phone"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Contact link (button href)</label>
            <input
              className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
              value={contactLink} onChange={(e)=>setContactLink(e.target.value)} placeholder="mailto:andy@example.com / tel:+44… / https://…"
            />
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-600">
            Cancel
          </button>
          <button onClick={submit}
            className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-1 text-sm text-yellow-300 hover:bg-yellow-500/20">
            Add listing
          </button>
        </div>
      </div>
    </div>
  );
}
