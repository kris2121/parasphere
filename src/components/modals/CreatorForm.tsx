'use client';

import React, { FormEvent } from 'react';

type CreatorFormProps = {
  handleAddCreator: (e: FormEvent<HTMLFormElement>) => void;
  locationsForSelect: Array<{ id: string; name: string }>;
  onCancel: () => void;

  mode: 'create' | 'edit';
  initialPost?: {
    id?: string;
    title?: string;
    description?: string;
    youtubeUrl?: string;
    locationId?: string;
  };
};


export default function CreatorForm({
  handleAddCreator,
  locationsForSelect,
  onCancel,
  mode,
  initialPost,
}: CreatorFormProps) {

  return (
    <form
      onSubmit={handleAddCreator}
      className="w-full max-w-lg rounded-md border border-neutral-800 bg-[#101118] p-4 text-sm text-neutral-100"
    >
      {/* hidden id so handler knows if this is an edit */}
      <input type="hidden" name="id" value={initialPost?.id ?? ''} />

      <h2 className="mb-3 text-lg font-semibold text-orange-300">
        {mode === 'edit' ? 'Edit Creator Video' : 'Add Creator Video'}
      </h2>


      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-neutral-300">
          Video title
        </label>
        <input
          name="title"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none"
          placeholder="e.g. Haunted Mill Street Barracks – Full Investigation"
          defaultValue={initialPost?.title ?? ''}
          required
        />

      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-neutral-300">
          Description (optional)
        </label>
        <textarea
          name="desc"
          rows={3}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none"
          placeholder="Short summary of what happens in the video..."
          defaultValue={initialPost?.description ?? ''}
        />

      </div>

      <div className="mb-3">
        <label className="mb-1 block text-xs font-medium text-neutral-300">
          YouTube link
        </label>
        <input
          name="youtubeUrl"
          type="url"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none"
          placeholder="https://www.youtube.com/watch?v=..."
          defaultValue={initialPost?.youtubeUrl ?? ''}
          required
        />

      </div>

      <div className="mb-4">
        <label className="mb-1 block text-xs font-medium text-neutral-300">
          Linked location
        </label>
        <select
          name="locationId"
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-2 py-1.5 text-sm text-neutral-100 outline-none"
          defaultValue={initialPost?.locationId ?? ''}
          required
        >

          <option value="">Select a location…</option>
          {locationsForSelect.map((loc) => (
            <option key={loc.id} value={loc.id}>
              {loc.name}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-4 flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-600 px-3 py-1.5 text-xs text-neutral-300 hover:bg-neutral-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-orange-500 px-3 py-1.5 text-xs font-medium text-black hover:bg-orange-400"
        >
          Post video
        </button>
      </div>
    </form>
  );
}
