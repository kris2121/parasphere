'use client';

import React, { FormEvent, useMemo, useState } from 'react';
import { Ghost } from 'lucide-react';
import type { LocationData } from '@/components/LiveMap';

type PostFormMode = 'create' | 'edit';

type InitialPost = {
  id: string;
  title?: string;
  desc?: string;
  linkUrl?: string;
  linkKind?: string;
  locationId?: string;
  tagUserIds?: string[];
};

type TaggableUser = {
  id: string;
  name: string;
};

type Props = {
  mode: PostFormMode;
  initialPost?: InitialPost;

  handleAddPost: (e: FormEvent<HTMLFormElement>) => void;
  postImg?: string;
  postImgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  postImgClear: () => void;

  // user tags (multi)
  postTagUsers: string[];
  setPostTagUsers: (ids: string[]) => void;
  taggableUsers: TaggableUser[];

  // location tag (single)
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
  { value: 'other', label: 'Other / Website' },
];

export default function PostForm({
  mode,
  initialPost,
  handleAddPost,
  postImg,
  postImgChange,
  postImgClear,
  postTagUsers,
  setPostTagUsers,
  taggableUsers,
  selectedLocId,
  setSelectedLocId,
  locQuery,
  setLocQuery,
  locationOptions,
  hasLocations,
}: Props) {
  const [activePlatform, setActivePlatform] = useState(
    initialPost?.linkKind &&
      SOCIAL_PLATFORMS.some((p) => p.value === initialPost.linkKind)
      ? initialPost.linkKind
      : 'youtube',
  );

  const [tagUserInput, setTagUserInput] = useState('');

  const activePlatformLabel =
    SOCIAL_PLATFORMS.find((p) => p.value === activePlatform)?.label ?? 'Link';

  const isEdit = mode === 'edit';

  // map tagged user IDs → full user objects
  const taggedUsers: TaggableUser[] = useMemo(() => {
    const map = new Map<string, TaggableUser>();
    taggableUsers.forEach((u) => map.set(u.id, u));
    return postTagUsers
      .map((id) => map.get(id))
      .filter((u): u is TaggableUser => Boolean(u));
  }, [postTagUsers, taggableUsers]);

  // user suggestions for typeahead
  const userSuggestions = useMemo(() => {
    const q = tagUserInput.trim().toLowerCase();
    if (!q) return [];
    return taggableUsers
      .filter(
        (u) =>
          !postTagUsers.includes(u.id) &&
          u.name.toLowerCase().startsWith(q),
      )
      .slice(0, 6);
  }, [tagUserInput, taggableUsers, postTagUsers]);

  function handleAddTagUser(userId: string) {
    if (postTagUsers.includes(userId)) return;
    setPostTagUsers([...postTagUsers, userId]);
    setTagUserInput('');
  }

  function handleRemoveTagUser(userId: string) {
    setPostTagUsers(postTagUsers.filter((id) => id !== userId));
  }

  // location suggestions for typeahead
  const locationSuggestions = useMemo(() => {
    if (!hasLocations) return [];
    const q = locQuery.trim().toLowerCase();
    if (!q) return [];
    return locationOptions
      .filter(
        (loc) =>
          loc.title.toLowerCase().includes(q) &&
          loc.id !== selectedLocId,
      )
      .slice(0, 8);
  }, [locQuery, locationOptions, hasLocations, selectedLocId]);

  const selectedLocation =
    selectedLocId &&
    locationOptions.find((loc) => loc.id === selectedLocId);

  function handleSelectLocation(locId: string) {
    setSelectedLocId(locId);
    setLocQuery('');
  }

  return (
    <form onSubmit={handleAddPost} className="space-y-3">
      {/* hidden ID so handleAddPost knows when it's editing */}
      <input type="hidden" name="id" defaultValue={initialPost?.id ?? ''} />

      {/* HEADER */}
      <h3 className="text-lg font-semibold text-cyan-300">
        {isEdit ? 'Edit post' : 'Create post'}
      </h3>

      {/* TITLE */}
      <input
        name="title"
        placeholder="Title your post…"
        required
        defaultValue={initialPost?.title ?? ''}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* DESCRIPTION */}
      <textarea
        name="desc"
        placeholder="Share what happened, where you were, what you captured…"
        rows={4}
        defaultValue={initialPost?.desc ?? ''}
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
      />

      {/* TAG USERS (multi) */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Tag added users (optional)
        </div>

        {taggedUsers.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {taggedUsers.map((u) => (
              <span
                key={u.id}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-100"
              >
                <span>@{u.name}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTagUser(u.id)}
                  className="text-[11px] text-neutral-300 hover:text-white"
                  title="Remove"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        <div className="relative">
          <input
            type="text"
            value={tagUserInput}
            onChange={(e) => setTagUserInput(e.target.value)}
            placeholder="Start typing an added user…"
            className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />

          {userSuggestions.length > 0 && (
            <div className="absolute z-20 mt-1 max-h-40 w-full overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950 text-sm shadow-lg">
              {userSuggestions.map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleAddTagUser(u.id)}
                  className="flex w-full items-center justify-between px-3 py-1.5 text-left text-neutral-200 hover:bg-neutral-800"
                >
                  <span>{u.name}</span>
                  <span className="text-xs text-cyan-300">Add</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TAG LOCATION (single, typeahead) */}
      <div>
        <div className="mb-1 text-xs font-semibold text-neutral-300">
          Tag an added location (optional)
        </div>

        {hasLocations ? (
          <>
            {/* current tagged location chip */}
            {selectedLocation && (
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-neutral-700 bg-neutral-900 px-3 py-1 text-xs text-neutral-100">
                <Ghost size={14} className="text-cyan-400" />
                <span>{selectedLocation.title}</span>
                <button
                  type="button"
                  onClick={() => setSelectedLocId('')}
                  className="text-[11px] text-neutral-300 hover:text-white"
                  title="Remove location tag"
                >
                  ×
                </button>
              </div>
            )}

            {/* typeahead input */}
            <div className="relative">
              <input
                type="text"
                value={locQuery}
                onChange={(e) => setLocQuery(e.target.value)}
                placeholder="Start typing an added location…"
                className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
              />

              {locationSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 max-h-48 w-full overflow-y-auto rounded-md border border-neutral-700 bg-neutral-950 text-sm shadow-lg">
                  {locationSuggestions.map((loc) => (
                    <button
                      key={loc.id}
                      type="button"
                      onClick={() => handleSelectLocation(loc.id)}
                      className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-neutral-200 hover:bg-neutral-800"
                    >
                      <Ghost size={14} className="text-cyan-400 shrink-0" />
                      <span>{loc.title}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-xs text-neutral-400">
            You haven’t added any locations yet. Add a haunt first, then you
            can tag it here.
          </div>
        )}
      </div>

      {/* WEB LINK */}
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

          <input
            name="link"
            type="text"
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
            defaultValue={initialPost?.linkUrl ?? ''}
            className="flex-1 rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white"
          />

          {/* hidden field so handleAddPost can read the type */}
          <input type="hidden" name="linkKind" value={activePlatform} />
        </div>
        <p className="mt-1 text-[11px] text-neutral-400">
          This will appear in the post as a clickable{' '}
          <span className="font-semibold">{activePlatformLabel}</span>.
        </p>
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
          {isEdit ? 'Save changes' : 'Post'}
        </button>
      </div>
    </form>
  );
}






