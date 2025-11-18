'use client';

import React, { FormEvent, useState, useEffect } from 'react';
import type { SocialLink } from '@/app/page'; // or wherever SocialLink is exported

type Props = {
  mode: 'create' | 'edit';
  initialItem?: {
    id: string;
    kind: 'Product' | 'Service';
    title: string;
    description: string;
    imageUrl?: string;
    countryCode?: string;
    postalCode?: string;
    socialLinks?: SocialLink[];
  };
  handleAddListing: (e: FormEvent<HTMLFormElement>) => void;
  mkImg?: string;
  mkImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  mkImgClear: () => void;
  country: string;
  countries: Array<{ code: string; name: string }>;
  onCancel: () => void;
};

// 🔹 Only a single option now: "Link"
const PLATFORMS: SocialLink['platform'][] = ['Link'];

export default function MarketplaceForm({
  mode,
  initialItem,
  handleAddListing,
  mkImg,
  mkImgChange,
  mkImgClear,
  country,
  countries,
  onCancel,
}: Props) {
  // 🔹 Default to "Link"
  const [platform, setPlatform] = useState<SocialLink['platform']>('Link');
  const [urlInput, setUrlInput] = useState('');
  const [links, setLinks] = useState<SocialLink[]>([]);

  // Seed links when editing
  useEffect(() => {
    if (initialItem?.socialLinks) {
      setLinks(initialItem.socialLinks);
    }
  }, [initialItem]);

  function addLink() {
    const trimmed = urlInput.trim();
    if (!trimmed) return;

    setLinks((prev) => [
      ...prev,
      {
        platform,
        url: trimmed,
      },
    ]);
    setUrlInput('');
  }

  function removeLink(idx: number) {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  const titleText =
    mode === 'edit' ? 'Edit Marketplace Listing' : 'Add Marketplace Listing';
  const submitText = mode === 'edit' ? 'Save changes' : 'Save Listing';

  return (
    <form onSubmit={handleAddListing} className="space-y-3">
      <h3 className="text-lg font-semibold text-yellow-300">{titleText}</h3>

      {/* hidden id for editing */}
      {mode === 'edit' && initialItem && (
        <input type="hidden" name="id" value={initialItem.id} />
      )}

      {/* hidden JSON social links */}
      <input
        type="hidden"
        name="socialLinks"
        value={JSON.stringify(links)}
      />

      {/* PRODUCT / SERVICE TOGGLE */}
      <div className="flex items-center gap-4 text-sm">
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="kind"
            value="Product"
            defaultChecked={
              initialItem ? initialItem.kind === 'Product' : true
            }
            className="accent-yellow-400"
          />
          <span>Product</span>
        </label>
        <label className="flex items-center gap-1">
          <input
            type="radio"
            name="kind"
            value="Service"
            defaultChecked={initialItem?.kind === 'Service'}
            className="accent-yellow-400"
          />
          <span>Service</span>
        </label>
      </div>

      {/* TITLE */}
      <input
        name="title"
        placeholder="Listing title"
        required
        defaultValue={initialItem?.title ?? ''}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="desc"
        placeholder="Describe the product or service, condition, what's included, delivery/collection details, etc."
        required
        defaultValue={initialItem?.description ?? ''}
        className="min-h-[120px] w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* WEB LINKS (multi) */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Web links
        </div>

        <div className="flex gap-2">
          <select
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as SocialLink['platform'])
            }
            className="w-32 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm text-white"
          >
            {PLATFORMS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            type="url"
            placeholder="Paste link…"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />

          <button
            type="button"
            onClick={addLink}
            className="rounded-md border border-yellow-500 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-200"
          >
            Add link
          </button>
        </div>

        {links.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {links.map((l, idx) => (
              <span
                key={`${l.platform}-${idx}`}
                className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-2 py-1 text-yellow-100"
              >
                {l.platform}
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="text-[10px] text-yellow-300/80 hover:text-yellow-100"
                >
                  ✕
                </button>
              </span>
            ))}
          </div>
        )}

        <p className="mt-1 text-[11px] text-neutral-400">
          Add one or more external links. In the feed they’ll show as clickable{' '}
          <span className="font-semibold">Link</span> badges – not as long URLs.
        </p>
      </div>

      {/* LOCATION (COUNTRY + POSTCODE) */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Location
        </div>
        <div className="grid grid-cols-3 items-start gap-2">
          <div className="col-span-2">
            <label className="mb-1 block text-xs text-neutral-400">
              Country
            </label>
            <select
              name="country"
              defaultValue={initialItem?.countryCode ?? country}
              required
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            >
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name} ({c.code})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs text-neutral-400">
              Area / post code
            </label>
            <input
              name="postal"
              placeholder="Post code"
              defaultValue={initialItem?.postalCode ?? ''}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* IMAGE UPLOAD + PREVIEW */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">Listing image</div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={mkImgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />

        {/* Preview: use new image if chosen, otherwise existing image while editing */}
        {(mkImg || initialItem?.imageUrl) && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mkImg || initialItem?.imageUrl}
              alt="preview"
              className="max-h-64 w-auto rounded-md border border-neutral-800"
            />
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-2 flex justify-end gap-2 border-t border-neutral-800 pt-3">
        <button
          type="button"
          onClick={() => {
            mkImgClear();
            onCancel();
          }}
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-yellow-500 bg-yellow-500/20 px-3 py-1.5 text-sm font-semibold text-yellow-200 hover:bg-yellow-500/30"
        >
          {submitText}
        </button>
      </div>
    </form>
  );
}
