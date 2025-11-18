// src/components/Modal.tsx
'use client';

import React from 'react';

type ModalProps = {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxW?: string;
};

export default function Modal({
  open,
  onClose,
  children,
  maxW = 'max-w-xl',
}: ModalProps) {
  if (!open) return null;

  return (
    <>
      <div className="fixed inset-0 z-[90] bg-black/60" onClick={onClose} />
      <div
        className={`fixed left-1/2 top-1/2 z-[91] w-[92vw] -translate-x-1/2 -translate-y-1/2 ${maxW} rounded-xl border border-neutral-800 bg-neutral-950 p-4`}
      >
        {children}
      </div>
    </>
  );
}
