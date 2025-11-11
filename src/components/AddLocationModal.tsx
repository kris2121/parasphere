'use client';

import { useEffect, useMemo, useState } from 'react';
import type { LocationData, SocialLinks } from './LiveMap';

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (loc: LocationData) => void;
  currentUserId: string;
  currentUserName: string;
  defaultCenter?: { lat: number; lng: number }; // optional convenience
};

export default function AddLocationModal({
  open, onClose, onSubmit, currentUserId, currentUserName, defaultCenter
}: Props) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'HAUNTING'|'UFO'|'CRYPTID'>('HAUNTING');
  const [lat, setLat] = useState<number>(defaultCenter?.lat ?? 54.3);
  const [lng, setLng] = useState<number>(defaultCenter?.lng ?? -2.5);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [summary, setSummary] = useState<string>('');

  const [address, setAddress] = useState('');
  const [what3words, setWhat3words] = useState(''); // manual for now
  const [openingHours, setOpeningHours] = useState('');
  const [priceInfo, setPriceInfo] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const [facebook, setFacebook] = useState('');
  const [instagram, setInstagram] = useState('');
  const [tiktok, setTiktok] = useState('');
  const [x, setX] = useState('');
  const [youtube, setYoutube] = useState('');

  useEffect(() => {
    if (!open) return;
    // reset
    setTitle('');
    setType('HAUNTING');
    setLat(defaultCenter?.lat ?? 54.3);
    setLng(defaultCenter?.lng ?? -2.5);
    setImageUrl('');
    setSummary('');
    setAddress('');
    setWhat3words('');
    setOpeningHours('');
    setPriceInfo('');
    setPhone('');
    setEmail('');
    setWebsite('');
    setFacebook('');
    setInstagram('');
    setTiktok('');
    setX('');
    setYoutube('');
  }, [open, defaultCenter]);

  if (!open) return null;

  function submit() {
    if (!title) return;
    const socials: SocialLinks = {};
    if (facebook) socials.facebook = facebook;
    if (instagram) socials.instagram = instagram;
    if (tiktok) socials.tiktok = tiktok;
    if (x) socials.x = x;
    if (youtube) socials.youtube = youtube;

    const loc: LocationData = {
      id: `loc_${crypto.randomUUID()}`,
      title, type, lat, lng,
      imageUrl: imageUrl || undefined,
      summary: summary || undefined,
      address: address || undefined,
      what3words: what3words || undefined,
      openingHours: openingHours || undefined,
      priceInfo: priceInfo || undefined,
      phone: phone || undefined,
      email: email || undefined,
      website: website || undefined,
      socials,
      uploader: { id: currentUserId, name: currentUserName },
    };
    onSubmit(loc);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/60">
      <div className="w-full max-w-3xl rounded-xl border border-neutral-800 bg-neutral-900 p-4">
        <h3 className="text-lg font-semibold mb-3">Add Location</h3>

        {/* Basic */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Title</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={title} onChange={e=>setTitle(e.target.value)} placeholder="Mill Street Barracks" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Type</label>
            <select className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                    value={type} onChange={e=>setType(e.target.value as any)}>
              <option value="HAUNTING">Haunting</option>
              <option value="UFO">UFO</option>
              <option value="CRYPTID">Cryptid</option>
            </select>
          </div>
        </div>

        {/* Coords + image */}
        <div className="grid sm:grid-cols-4 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Latitude</label>
            <input type="number" step="0.000001"
                   className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={lat} onChange={e=>setLat(parseFloat(e.target.value))} />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Longitude</label>
            <input type="number" step="0.000001"
                   className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={lng} onChange={e=>setLng(parseFloat(e.target.value))} />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Main photo (URL)</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   placeholder="https://…"
                   value={imageUrl} onChange={e=>setImageUrl(e.target.value)} />
          </div>
        </div>

        {/* Summary */}
        <div className="mt-3">
          <label className="block text-sm text-neutral-300 mb-1">Summary</label>
          <textarea className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm h-20"
                    value={summary} onChange={e=>setSummary(e.target.value)}
                    placeholder="Key details visitors should know…" />
        </div>

        {/* Contact & venue info */}
        <div className="grid sm:grid-cols-2 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Address</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={address} onChange={e=>setAddress(e.target.value)} placeholder="Street, Town, Postcode" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">/// what3words</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={what3words} onChange={e=>setWhat3words(e.target.value)} placeholder="word.word.word" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Opening hours</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={openingHours} onChange={e=>setOpeningHours(e.target.value)} placeholder="Fri–Sat 18:00–23:00" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Prices</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={priceInfo} onChange={e=>setPriceInfo(e.target.value)} placeholder="£10 entry" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Phone</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+44 1234 567890" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Email</label>
            <input type="email" className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={email} onChange={e=>setEmail(e.target.value)} placeholder="contact@example.com" />
          </div>
          <div className="sm:col-span-2">
            <label className="block text-sm text-neutral-300 mb-1">Website</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={website} onChange={e=>setWebsite(e.target.value)} placeholder="https://…" />
          </div>
        </div>

        {/* Socials */}
        <div className="grid sm:grid-cols-3 gap-3 mt-3">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Facebook</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={facebook} onChange={e=>setFacebook(e.target.value)} placeholder="https://facebook.com/…" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Instagram</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={instagram} onChange={e=>setInstagram(e.target.value)} placeholder="https://instagram.com/…" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">TikTok</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={tiktok} onChange={e=>setTiktok(e.target.value)} placeholder="https://tiktok.com/@…" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">X (Twitter)</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={x} onChange={e=>setX(e.target.value)} placeholder="https://x.com/…" />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">YouTube</label>
            <input className="w-full rounded-md border border-neutral-700 bg-neutral-950 p-2 text-sm"
                   value={youtube} onChange={e=>setYoutube(e.target.value)} placeholder="https://youtube.com/@…" />
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex justify-end gap-2">
          <button onClick={onClose} className="rounded-md border border-neutral-700 px-3 py-1 text-sm hover:border-neutral-600">
            Cancel
          </button>
          <button onClick={submit} className="rounded-md border border-cyan-600 bg-cyan-500/10 px-3 py-1 text-sm hover:bg-cyan-500/20">
            Add location
          </button>
        </div>

        <div className="mt-2 text-[11px] text-neutral-500">
          Note: what3words auto-fill will need an API call later. For now, enter it manually (e.g., <code>///word.word.word</code>).
        </div>
      </div>
    </div>
  );
}
