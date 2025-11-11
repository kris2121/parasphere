'use client';

import { useEffect, useMemo, useState, FormEvent } from 'react';

/** Local copy of the shape we use elsewhere */
type MarketplaceItem = {
  id: string;
  kind: 'Product' | 'Service';
  title: string;
  description: string;
  price?: number;
  locationText?: string;
  imageUrl?: string;
  contactOrLink?: string;
  createdAt: number;
  postedBy: { id: string; name: string };
};

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: (m: MarketplaceItem) => void;
};

export default function AddListingModal({ open, onClose, onCreate }: Props) {
  if (!open) return null;

  const [kind, setKind] = useState<'Product' | 'Service'>('Product');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [price, setPrice] = useState<string>('');
  const [where, setWhere] = useState('');
  const [contact, setContact] = useState('');
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageDataUrl, setImageDataUrl] = useState<string | undefined>(undefined);

  // preview for local image
  useEffect(() => {
    if (!imageDataUrl) return;
    if (imageUrl) URL.revokeObjectURL(imageUrl);
    const blob = dataURLtoBlob(imageDataUrl);
    const url = URL.createObjectURL(blob);
    setImageUrl(url);
    return () => URL.revokeObjectURL(url);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [imageDataUrl]);

  const allowPrice = useMemo(() => kind === 'Product', [kind]);

  function onImageChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) {
      setImageUrl(undefined);
      setImageDataUrl(undefined);
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setImageDataUrl(String(reader.result || ''));
    reader.readAsDataURL(f);
  }

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    const m: MarketplaceItem = {
      id: crypto.randomUUID(),
      kind,
      title: title.trim(),
      description: desc.trim(),
      price: allowPrice ? Number(price) || undefined : undefined,
      locationText: where.trim() || undefined,
      imageUrl,
      contactOrLink: contact.trim() || undefined,
      createdAt: Date.now(),
      postedBy: { id: 'u_current', name: 'You' }, // replace with Supabase auth later
    };

    onCreate(m);
    onClose();
    // reset (optional)
    setTitle('');
    setDesc('');
    setPrice('');
    setWhere('');
    setContact('');
    setImageUrl(undefined);
    setImageDataUrl(undefined);
    setKind('Product');
  }

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 z-[91] -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-xl rounded-xl border border-neutral-800 bg-neutral-950 p-4">
        <form onSubmit={submit} className="space-y-3">
          <h3 className="text-lg font-semibold">Add Listing</h3>

          <select
            value={kind}
            onChange={(e) => setKind(e.target.value as 'Product' | 'Service')}
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          >
            <option value="Product">Product</option>
            <option value="Service">Service</option>
          </select>

          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Description"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

          <div className="grid grid-cols-2 gap-2">
            <input
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Price (optional)"
              disabled={!allowPrice}
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 disabled:opacity-50"
            />
            <input
              value={where}
              onChange={(e) => setWhere(e.target.value)}
              placeholder="Location (optional)"
              className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
            />
          </div>

          <div>
            <div className="text-sm text-neutral-300 mb-1">Photo (optional)</div>
            <input type="file" accept="image/*" onChange={onImageChange} className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 w-full" />
            {imageUrl && (
              <div className="rounded-md border border-neutral-800 bg-neutral-950 p-2 mt-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={imageUrl} alt="preview" className="max-h-64 w-auto rounded-md border border-neutral-800" />
              </div>
            )}
          </div>

          <input
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="Contact or link"
            required
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
          />

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

/* util: convert dataURL -> Blob */
function dataURLtoBlob(dataUrl: string): Blob {
  const parts = dataUrl.split(',');
  const mimeMatch = parts[0].match(/:(.*?);/);
  const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

