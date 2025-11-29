'use client';

import React from 'react';
import CollaborationFeed from '@/components/feed/CollaborationFeed';
import { CountrySelect, SectionDisclaimer } from '@/components/ParaverseScope';

type CollabSectionProps = {
  country: string;
  items: any[]; // keep loose here
  currentUserId: string;

  // NEW: admin flag so admins can edit/delete any collab
  isAdmin: boolean;

  onOpenDM: (userId: string) => void;
  onAddCollab: () => void;
  onOpenLocation: (locId: string) => void;
  onOpenUser: (userId: string) => void;
  onOpenImage: (src: string) => void;

  onEditCollab: (id: string) => void;
  onDeleteCollab: (id: string) => void;
};

export default function CollabSection({
  country,
  items,
  currentUserId,
  isAdmin,
  onAddCollab,
  onOpenDM,
  onOpenLocation,
  onOpenUser,
  onOpenImage,
  onEditCollab,
  onDeleteCollab,
}: CollabSectionProps) {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold text-emerald-300">
        Collaborations
      </h1>

      <SectionDisclaimer>
        Collaboration posts are arranged between users. Paraverse does not
        mediate or guarantee any arrangement.
      </SectionDisclaimer>

      <div className="mb-4">
        <CountrySelect />
      </div>

      <div className="mb-4">
        <button
          onClick={onAddCollab}
          className="rounded-md border border-emerald-500 bg-emerald-500/10 px-3 py-1.5 text-sm text-emerald-300"
        >
          + Add Collaboration
        </button>
      </div>

      <CollaborationFeed
        country={country}
        items={items}
        currentUserId={currentUserId}
        isAdmin={isAdmin}
        onMessageUser={onOpenDM}
        onOpenLocation={onOpenLocation}
        onOpenUser={onOpenUser}
        onOpenImage={onOpenImage}
        onEditCollab={onEditCollab}
        onDeleteCollab={onDeleteCollab}
      />
    </>
  );
}

