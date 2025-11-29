'use client';

import { useState } from 'react';

export function useImagePreview() {
  const [url, setUrl] = useState<string | undefined>(undefined);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState<string | undefined>(undefined);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);

    if (!f) {
      setUrl(undefined);
      setName(undefined);
      return;
    }

    setName(f.name);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result;
      if (typeof result === 'string') {
        setUrl(result);
      }
    };
    reader.readAsDataURL(f);
  }

  function clear() {
    setFile(null);
    setUrl(undefined);
    setName(undefined);
  }

  return { url, file, name, onChange, clear };
}

