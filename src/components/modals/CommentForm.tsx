'use client';

import React from 'react';

type Props = {
  text: string;
  setText: (v: string) => void;

  img: string | undefined;
  imgName?: string;
  imgChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  imgClear: () => void;

  tags: string[];
  setTags: (v: string[]) => void;

  usersById: Record<string, { id: string; name: string }>;

  canSubmit: boolean;
  onCancel: () => void;
  onSubmit: () => void;
};

export default function CommentForm({
  text,
  setText,
  img,
  imgName,
  imgChange,
  imgClear,
  tags,
  setTags,
  usersById,
  canSubmit,
  onCancel,
  onSubmit,
}: Props) {
  function toggleTag(id: string) {
    if (tags.includes(id)) {
      setTags(tags.filter((x) => x !== id));
    } else {
      setTags([...tags, id]);
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!canSubmit) return;
    onSubmit();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <h3 className="text-lg font-semibold">Add Comment</h3>

      {/* Text */}
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Write your comment…"
        className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
      />

      {/* Image */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">
          Attach photo (optional)
        </div>
        <input
          type="file"
          accept="image/*"
          onChange={imgChange}
          className="w-full rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2"
        />
        {img && (
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950 p-2">
            <img
              src={img}
              alt="preview"
              className="max-h-56 w-auto rounded-md border border-neutral-800"
            />
            <div className="mt-2 flex items-center justify-between text-xs text-neutral-400">
              <span className="truncate">{imgName}</span>
              <button
                type="button"
                onClick={imgClear}
                className="text-neutral-300 hover:underline"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tags */}
      <div>
        <div className="mb-1 text-sm text-neutral-300">
          Tag friends (optional)
        </div>
        <div className="flex flex-wrap gap-2">
          {Object.values(usersById).map((u) => (
            <button
              key={u.id}
              type="button"
              onClick={() => toggleTag(u.id)}
              className={`rounded-full border px-3 py-1 text-sm ${
                tags.includes(u.id)
                  ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                  : 'border-neutral-700 text-neutral-300'
              }`}
            >
              {u.name}
            </button>
          ))}
          {Object.values(usersById).length === 0 && (
            <span className="text-xs text-neutral-600">No users yet.</span>
          )}
        </div>
      </div>

      {/* Buttons */}
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-neutral-700 px-3 py-1.5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={!canSubmit}
          className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 hover:bg-cyan-500/20 disabled:opacity-50"
        >
          Post comment
        </button>
      </div>
    </form>
  );
}

