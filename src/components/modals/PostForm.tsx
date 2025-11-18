'use client';

import React, { FormEvent } from 'react';
import type { LocationData } from '@/components/LiveMap';

type Props = {
  handleAddPost: (e: FormEvent<HTMLFormElement>) => void;
  postImg?: string;
  postImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  postImgClear: () => void;

  postTagUsers: string[];
  setPostTagUsers: (ids: string[]) => void;

  selectedLocId: string;
  setSelectedLocId: (id: string) => void;

  locQuery: string;
  setLocQuery: (v: string) => void;

  locationOptions: LocationData[];
  hasLocations: boolean;
};

const SOCIAL_PLATFORMS = [
  { value: 'youtube', label: 'YouTube' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'instagram', label: 'Instagram' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'Link', label: 'Other / Website' },
];

export default function PostForm({
  handleAddPost,
  postImg,
  postImgChange,
  postImgClear,
  selectedLocId,
  setSelectedLocId,
  locQuery,
  setLocQuery,
  locationOptions,
  hasLocations,
}: Props) {
  const [activePlatform, setActivePlatform] = React.useState('youtube');

  const activePlatformLabel =
    SOCIAL_PLATFORMS.find((p) => p.value === activePlatform)?.label ?? 'Link';

  return (
    <form onSubmit={handleAddPost} className="space-y-3">
      {/* HEADER */}
      <h3 className="text-lg font-semibold text-cyan-300">Create post</h3>

      {/* TITLE */}
      <input
        name="title"
        placeholder="Title your post…"
        required
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="desc"
        placeholder="Share what happened, where you were, what you captured…"
        rows={4}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* SOCIAL / WEB LINK */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Web link
        </div>
        <div className="flex flex-col gap-2 md:flex-row">
          <select
            value={activePlatform}
            onChange={(e) => setActivePlatform(e.target.value)}
            className="md:w-40 rounded-md border border-cyan-500/60 bg-neutral-900 px-2 py-2 text-sm text-cyan-200"
          >
            {SOCIAL_PLATFORMS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          {/* we send both the URL/text and the chosen platform */}
          <input
            name="link"
            type="text"  // <— changed from "url" so it accepts any text
            placeholder={
              activePlatform === 'youtube'
                ? 'Paste YouTube link…'
                : activePlatform === 'tiktok'
                ? 'Paste TikTok link…'
                : activePlatform === 'instagram'
                ? 'Paste Instagram link…'
                : activePlatform === 'facebook'
                ? 'Paste Facebook link…'
                : 'Paste website / other link…'
            }
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />

          {/* hidden field so handleAddPost can read the type */}
          <input type="hidden" name="linkKind" value={activePlatform} />
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">
          This will appear in the post as a clickable{' '}
          <span className="font-semibold">
            {activePlatformLabel}
          </span>
          .
        </p>
      </div>

      {/* LOCATION ATTACH (OPTIONAL) */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Attach a location (optional)
        </div>

        {hasLocations ? (
          <>
            <input
              type="text"
              value={locQuery}
              onChange={(e) => setLocQuery(e.target.value)}
              placeholder="Search your added locations…"
              className="mb-2 w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            />

            <select
              value={selectedLocId}
              onChange={(e) => setSelectedLocId(e.target.value)}
              className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
            >
              <option value="">No location attached</option>
              {locationOptions.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.title}
                </option>
              ))}
            </select>
          </>
        ) : (
          <div className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
            You haven’t added any locations yet. Add a haunt first, then you
            can attach it to posts.
          </div>
        )}
      </div>

      {/* IMAGE */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">
          Attach image (optional)
        </div>
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={postImgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
        />
        {postImg && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={postImg}
              alt="preview"
              className="max-h-64 w-auto rounded-md border border-neutral-800"
            />
          </div>
        )}
      </div>

      {/* FOOTER BUTTONS */}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            postImgClear();
          }}
          className="rounded-md border border-neutral-700 px-3 py-1.5 text-sm text-neutral-200 hover:bg-neutral-800"
        >
          Clear image
        </button>
        <button
          type="submit"
          className="rounded-md border border-cyan-500 bg-cyan-500/10 px-4 py-1.5 text-sm font-semibold text-cyan-200 hover:bg-cyan-500/20"
        >
          Post
        </button>
      </div>
    </form>
  );
}
