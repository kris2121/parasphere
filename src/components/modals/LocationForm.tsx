'use client';

import React, { FormEvent, useState } from 'react';

type CountryOption = {
  code: string;
  name: string;
};

type LocationFormProps = {
  handleAddLocation: (e: FormEvent<HTMLFormElement>) => void;
  locImg: string | null;
  locImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  country: string;
  countries: CountryOption[];
  onCancel: () => void;
};

type SocialLink = {
  platform: string;
  url: string;
};

const SOCIAL_OPTIONS: SocialLink['platform'][] = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'Link',
];

export default function LocationForm({
  handleAddLocation,
  locImg,
  locImgChange,
  country,
  countries,
  onCancel,
}: LocationFormProps) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState<SocialLink['platform']>('YouTube');
  const [url, setUrl] = useState('');
  const [primaryUrl, setPrimaryUrl] = useState(''); // feeds the existing "website" field

  function addLink() {
    const trimmed = url.trim();
    if (!trimmed) return;

    const next = [...links, { platform, url: trimmed }];
    setLinks(next);

    // first added link becomes the primary website value
    if (!primaryUrl) {
      setPrimaryUrl(trimmed);
    }

    setUrl('');
  }

  function removeLink(idx: number) {
    setLinks((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // keep primary URL in sync with first remaining link (if any)
      const nextPrimary = next[0]?.url ?? '';
      setPrimaryUrl(nextPrimary);
      return next;
    });
  }

  return (
    <form onSubmit={handleAddLocation} className="space-y-3">
      <h3 className="text-lg font-semibold text-white">Add Location</h3>

      {/* Hidden fields – keep behaviour compatible with existing handler */}
      <input
        type="hidden"
        name="socialLinks"
        value={JSON.stringify(links)}
      />
      <input type="hidden" name="website" value={primaryUrl} />

      {/* TITLE */}
      <input
        name="title"
        placeholder="Location title"
        required
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="summary"
        placeholder="Describe the location, history, access details, any important rules or requirements, and pricing…"
        className="min-h-[140px] w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* CONTACT */}
      <input
        name="address"
        placeholder="Contact info (email, phone or booking contact)"
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* WEB LINKS – MATCH EVENTS LAYOUT, WHITE THEME */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Web links
        </div>

        <div className="flex gap-2">
          <select
            className="w-32 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm text-white"
            value={platform}
            onChange={(e) =>
              setPlatform(e.target.value as SocialLink['platform'])
            }
          >
            {SOCIAL_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>

          <input
            placeholder={`Paste ${platform} link…`}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />

          <button
            type="button"
            onClick={addLink}
            className="rounded-md border border-white bg-white/5 px-3 py-2 text-sm text-white hover:bg-white/10"
          >
            Add link
          </button>
        </div>

        {links.length > 0 ? (
          <div className="mt-2 space-y-1 text-xs">
            {links.map((l, idx) => (
              <div
                key={`${l.platform}-${idx}-${l.url}`}
                className="flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1"
              >
                <span className="text-neutral-100">
                  <span className="font-semibold text-white">
                    {l.platform}
                  </span>{' '}
                  <span className="text-neutral-400">link added</span>
                </span>
                <button
                  type="button"
                  onClick={() => removeLink(idx)}
                  className="text-[11px] text-neutral-400 hover:text-neutral-200"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-1 text-[11px] text-neutral-500">
            Add one or more official links for this location (website, booking
            page, social media, etc). In the feed they’ll show as clickable
            badges – not long URLs.
          </p>
        )}
      </div>

      {/* LOCATION (COUNTRY + POSTCODE, REQUIRED) */}
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
              defaultValue={country}
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
              required
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* IMAGE */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">Main photo</div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={locImgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />
        {locImg && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={locImg}
              alt="preview"
              className="max-h-64 w-auto rounded-md border border-neutral-800"
            />
          </div>
        )}
      </div>

      {/* FOOTER: LEGAL OWNER + BUTTONS */}
      <div className="mt-2 flex flex-col gap-3 border-t border-neutral-800 pt-3 md:flex-row md:items-center md:justify-between">
        <label className="flex max-w-xl items-start gap-2 text-xs text-red-300">
          <input
            type="checkbox"
            name="verifiedByOwner"
            className="mt-[2px] h-4 w-4 rounded border-red-500 bg-neutral-900"
          />
          <span>
            <span className="font-semibold">Legal owner declaration</span>
            <span className="ml-1 text-red-200/80">
            </span>
          </span>
        </label>

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="rounded-md border border-white bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20"
          >
            Save Location
          </button>
        </div>
      </div>
    </form>
  );
}

