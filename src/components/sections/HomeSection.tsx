'use client';

import React from 'react';
import HomeFeed from '@/components/feed/HomeFeed';
import type { UserMini } from '@/components/UserDrawer';
import {
  CountrySelect,
  SectionDisclaimer,
} from '@/components/ParaverseScope';

type HomeSectionProps = {
  currentUser: { id: string; name: string; avatarUrl?: string };

  feedFilter: 'favLocations' | 'favUsers' | 'all';
  setFeedFilter: (v: 'favLocations' | 'favUsers' | 'all') => void;

  filteredPosts: any[];
  editPost: (id: string, patch: Partial<any>) => void;
  deletePost: (id: string) => void;
  canEditPost: (p: any) => boolean;

  comments: Record<string, any[]>;
  openComment: (key: string, parentId?: string) => void;
  openEditComment: (key: string, id: string) => void;
  canEditComment: (c: any) => boolean;

  usersById: Record<string, UserMini>;
  followedUsers: string[];
  openUser: (id: string) => void;

  sortPosts: (a: any, b: any) => number;

  setPostFormOpen: (open: boolean) => void;
  onOpenImage: (src: string) => void;
};

export default function HomeSection(props: HomeSectionProps) {
  const {
    currentUser,
    feedFilter,
    setFeedFilter,
    filteredPosts,
    editPost,
    deletePost,
    canEditPost,
    comments,
    openComment,
    openEditComment,
    canEditComment,
    usersById,
    followedUsers,
    openUser,
    sortPosts,
    setPostFormOpen,
    onOpenImage,
  } = props;

  return (
    <div className="mb-6">
      <h1 className="text-2xl font-semibold text-cyan-300">
        Paraverse Home
      </h1>

      {/* Behaviour / rules disclaimer */}
      <div className="mt-3">
        <SectionDisclaimer>
          Content is community-submitted. Paraverse reserves the right
          to restrict or remove posts that involve harassment, abuse,
          spam, or unsafe behaviour.
        </SectionDisclaimer>
      </div>

      {/* Country scope pill */}
      <div className="mb-3">
        <CountrySelect />
      </div>

      {/* Add Post button */}
      <div className="mt-1">
        <button
          onClick={() => setPostFormOpen(true)}
          className="rounded-md border border-cyan-500 bg-cyan-500/10 px-3 py-1.5 text-sm text-cyan-300"
        >
          + Add Post
        </button>
      </div>

      {/* Filter Chips */}
      <div className="mt-3 flex flex-wrap gap-2 text-xs">
        <button
          className={`rounded-full border px-3 py-1 ${
            feedFilter === 'all'
              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setFeedFilter('all')}
        >
          All
        </button>

        <button
          className={`rounded-full border px-3 py-1 ${
            feedFilter === 'favLocations'
              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setFeedFilter('favLocations')}
        >
          Added Locations
        </button>

        <button
          className={`rounded-full border px-3 py-1 ${
            feedFilter === 'favUsers'
              ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
              : 'border-neutral-700 text-neutral-300'
          }`}
          onClick={() => setFeedFilter('favUsers')}
        >
          Added Users
        </button>
      </div>

      {/* HOME FEED LIST */}
      <div className="mt-6">
        <HomeFeed
          currentUser={currentUser}
          posts={filteredPosts}
          onEditPost={editPost}
          onDeletePost={deletePost}
          canEditPost={canEditPost}
          comments={comments}
          onOpenComment={openComment}
          onOpenEditComment={openEditComment}
          canEditComment={canEditComment}
          usersById={usersById}
          followedUsers={followedUsers}
          onOpenUser={openUser}
          sortPosts={sortPosts}
          onOpenImage={onOpenImage}
        />
      </div>
    </div>
  );
}
