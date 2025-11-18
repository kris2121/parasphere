'use client';

import { useState } from 'react';

export function useImagePreview() {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [name, setName] = useState<string | undefined>(undefined);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;

    if (!f) {
      setUrl(undefined);
      setName(undefined);
      return;
    }

    const objectUrl = URL.createObjectURL(f);
    setUrl(objectUrl);
    setName(f.name);
  }

  function clear() {
    // Just clear local state – do NOT revoke the URL,
    // otherwise existing posts/comments using it will break.
    setUrl(undefined);
    setName(undefined);
  }

  return { url, name, onChange, clear };
}
