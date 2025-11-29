'use client';

import React from 'react';
import CreatorsFeed, { CreatorPost } from '@/components/feed/CreatorsFeed';
import { CountrySelect, SectionDisclaimer } from '@/components/ParaverseScope';

type CreatorsSectionProps = {
  currentUser: { id: string; name: string; avatarUrl?: string };

  posts: CreatorPost[];
  sortPosts: (a: CreatorPost, b: CreatorPost) => number;

  onOpenUser: (id: string) => void;
  onOpenLocation: (locationId: string) => void;

  // open the create/edit modal
  onOpenCreateForm: () => void;

  // edit/delete + ownership check
  onEditPost: (post: CreatorPost) => void;
  onDeletePost: (id: string) => void;
  canEditPost: (p: CreatorPost) => boolean;

  // NEW: reporting
  onReportPost: (post: CreatorPost) => void;
};

export default function CreatorsSection({
  currentUser,
  posts,
  sortPosts,
  onOpenUser,
  onOpenLocation,
  onOpenCreateForm,
  onEditPost,
  onDeletePost,
  canEditPost,
  onReportPost,
}: CreatorsSectionProps) {
  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-orange-300">
        Creators Hub
      </h1>

      {/* Behaviour / rules disclaimer */}
      <div className="mt-3">
        <SectionDisclaimer>
          Share your paranormal YouTube videos and podcasts, linked to real
          locations in the Paraverse map. No spam, harassment, or misleading
          content.
        </SectionDisclaimer>
      </div>

      {/* Country scope pill */}
      <div className="mb-3 mt-3">
        <CountrySelect />
      </div>

      {/* Add Creator Video button */}
      <div className="mt-1">
        <button
          onClick={onOpenCreateForm}
          className="rounded-md border border-orange-500 bg-orange-500/10 px-3 py-1.5 text-sm text-orange-300"
        >
          + Add Creator Video
        </button>
      </div>

      {/* Creators feed list */}
      <div className="mt-4">
        <CreatorsFeed
          posts={posts}
          sortPosts={sortPosts}
          onOpenUser={onOpenUser}
          onOpenLocation={onOpenLocation}
          onEditPost={onEditPost}
          onDeletePost={onDeletePost}
          canEditPost={canEditPost}
          onReportVideo={onReportPost}
        />
      </div>
    </div>
  );
}



