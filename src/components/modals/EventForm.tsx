'use client';

import React, { FormEvent, useState } from 'react';

type Country = { code: string; name: string };

type Props = {
  handleAddEvent: (e: FormEvent<HTMLFormElement>) => void;
  evImg?: string; // preview URL
  evImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  country: string;
  countries: Country[];
  onCancel: () => void;
};

type SocialLink = { platform: string; url: string };

const SOCIAL_OPTIONS: SocialLink['platform'][] = [
  'YouTube',
  'TikTok',
  'Instagram',
  'Facebook',
  'Link',
];

export default function EventForm({
  handleAddEvent,
  evImg,
  evImgChange,
  country,
  countries,
  onCancel,
}: Props) {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [platform, setPlatform] = useState<SocialLink['platform']>('YouTube');
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
    <form onSubmit={handleAddEvent} className="space-y-3">
      {/* TITLE */}
      <h3 className="text-lg font-semibold text-purple-300">Add Event</h3>

      {/* HIDDEN SOCIAL LINKS FIELD */}
      <input type="hidden" name="socialLinks" value={JSON.stringify(links)} />

      {/* EVENT TITLE */}
      <input
        name="title"
        placeholder="Event title"
        required
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="desc"
        placeholder="Describe the event, including date, time, meeting place, schedule and any important details…"
        className="min-h-[140px] w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* SOCIAL LINKS – COMPACT LIKE MARKETPLACE */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Web links
        </div>

        {/* Row: select + input + button (same structure as marketplace) */}
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
            className="rounded-md border border-purple-500 bg-purple-500/10 px-3 py-2 text-sm text-purple-200 hover:bg-purple-500/20"
          >
            Add link
          </button>
        </div>

        {/* Compact list of added links below, same width as above row */}
        {links.length > 0 ? (
          <div className="mt-2 space-y-1 text-xs">
            {links.map((l, idx) => (
              <div
                key={`${l.platform}-${idx}-${l.url}`}
                className="flex items-center justify-between rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1"
              >
                <span className="text-neutral-100">
                  <span className="font-semibold text-purple-200">
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

      {/* IMAGE WITH PREVIEW */}
      <div>
        <div className="mb-1 text-sm text-purple-200">Event image</div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={evImgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />
        {evImg && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={evImg}
              alt="preview"
              className="max-h-64 w-auto rounded-md border border-neutral-800"
            />
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-3 flex justify-end gap-2 border-t border-neutral-800 pt-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md border border-purple-400 bg-purple-500/20 px-3 py-1.5 text-sm font-medium text-purple-100 hover:bg-purple-500/30"
        >
          Save Event
        </button>
      </div>
    </form>
  );
}










