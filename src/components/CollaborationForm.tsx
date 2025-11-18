'use client';

import React, { FormEvent, useState } from 'react';

type SocialPlatform = 'YouTube' | 'TikTok' | 'Instagram' | 'Facebook' | 'Link';

type SocialLink = {
  platform: SocialPlatform;
  url: string;
};

type Props = {
  handleAddCollab: (e: FormEvent<HTMLFormElement>) => void;
  cbImg?: string;
  cbImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  country: string;
  countries: Array<{ code: string; name: string }>;
  onCancel: () => void;

  // NEW: edit support
  mode?: 'create' | 'edit';
  initialCollab?: {
    id?: string;
    title?: string;
    description?: string;
    countryCode?: string;
    postalCode?: string;
    socialLinks?: SocialLink[];
  };
};

const PLATFORM_OPTIONS: SocialPlatform[] = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'Link',
];

export default function CollaborationForm({
  handleAddCollab,
  cbImg,
  cbImgChange,
  country,
  countries,
  onCancel,
  mode = 'create',
  initialCollab,
}: Props) {
  const [links, setLinks] = useState<SocialLink[]>(
    initialCollab?.socialLinks ?? [],
  );
  const [platform, setPlatform] = useState<SocialPlatform>('YouTube');
  const [url, setUrl] = useState('');

  function addLink() {
    const trimmed = url.trim();
    if (!trimmed) return;

    setLinks((prev) => [...prev, { platform, url: trimmed }]);
    setUrl('');
  }

  function removeLink(idx: number) {
    setLinks((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <form onSubmit={handleAddCollab} className="space-y-3">
      {/* hidden id so handleAddCollab knows if this is an edit */}
      <input type="hidden" name="id" value={initialCollab?.id ?? ''} />

      <h3 className="text-lg font-semibold text-emerald-300">
        {mode === 'edit' ? 'Edit Collaboration' : 'Add Collaboration'}
      </h3>

      {/* HIDDEN SOCIAL LINKS FIELD */}
      <input type="hidden" name="socialLinks" value={JSON.stringify(links)} />

      {/* TITLE */}
      <input
        name="title"
        placeholder="Collaboration title"
        required
        defaultValue={initialCollab?.title ?? ''}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="desc"
        placeholder="Describe the collaboration, including date, time, rough plan and what you’re looking for…"
        defaultValue={initialCollab?.description ?? ''}
        className="min-h-[140px] w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* WEB LINKS – MATCH EVENTS LAYOUT, EMERALD COLOURS */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Web links
        </div>

        <div className="flex gap-2">
          <select
            value={platform}
            onChange={(e) => setPlatform(e.target.value as SocialPlatform)}
            className="w-32 rounded-md border border-neutral-700 bg-neutral-900 px-2 py-2 text-sm text-white"
          >
            {PLATFORM_OPTIONS.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>

          <input
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={`Paste ${platform} link…`}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />

          <button
            type="button"
            onClick={addLink}
            className="rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200 hover:bg-emerald-500/20"
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
                  <span className="font-semibold text-emerald-200">
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
            Add one or more external links (YouTube, TikTok, etc). In the feed
            they’ll show as clickable platform badges – not as long URLs.
          </p>
        )}
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
              defaultValue={initialCollab?.countryCode || country}
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
              defaultValue={initialCollab?.postalCode ?? ''}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />
          </div>
        </div>
      </div>

      {/* IMAGE */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">Collaboration image</div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={cbImgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />
        {cbImg && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={cbImg}
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
          onClick={onCancel}
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-emerald-500 bg-emerald-500/15 px-3 py-1.5 text-sm text-emerald-200 hover:bg-emerald-500/25"
        >
          Save Collaboration
        </button>
      </div>
    </form>
  );
}
