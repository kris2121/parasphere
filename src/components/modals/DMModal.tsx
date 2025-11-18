'use client';

import React, { FormEvent } from 'react';
import Modal from '@/components/Modal';

type Props = {
  open: boolean;
  onClose: () => void;
  dmRecipientName: string | null;
  dmText: string;
  setDmText: (value: string) => void;
  onSend: (e: FormEvent<HTMLFormElement>) => void;
};

export default function DMModal({
  open,
  onClose,
  dmRecipientName,
  dmText,
  setDmText,
  onSend,
}: Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={onSend} className="space-y-3">
        <h3 className="text-lg font-semibold">
          {dmRecipientName ? `Message ${dmRecipientName}` : 'New Message'}
        </h3>

        <textarea
          value={dmText}
          onChange={(e) => setDmText(e.target.value)}
          placeholder="Type your message…"
          className="h-32 w-full resize-none rounded-md border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
        />

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-neutral-700 px-3 py-1.5"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={!dmText.trim()}
            className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-cyan-300 disabled:opacity-40"
          >
            Send Message
          </button>
        </div>
      </form>
    </Modal>
  );
}
