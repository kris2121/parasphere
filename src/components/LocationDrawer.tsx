'use client';

import React from 'react';
import { X, Star, MapPin, User as UserIcon } from 'lucide-react';
import type { LocationData } from './LiveMap';

type Review = {
  id: string;
  authorId: string;
  authorName: string;
  createdAt: number;
  text?: string;
  imageUrl?: string;
};

type Props = {
  variant?: 'center' | 'side';
  open: boolean;
  location?: LocationData | null;

  // stars + added
  starCount?: number;
  onGiveLocationStar: (locId: string) => void;

  isFollowed: boolean;
  onFollowLocation: (locId: string) => void;

  // navigation
  onClickLocationTitle?: () => void;
  onClose: () => void;

  // reviews
  reviews?: Review[];
  canEditReview?: (r: Review) => boolean;
  onAddReview: () => void;
  onEditReview: (reviewId: string) => void;
};

function formatShortDate(ms: number) {
  const d = new Date(ms);
  return d.toLocaleString(undefined, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function LocationDrawer({
  variant = 'center',
  open,
  location,
  starCount = 0,
  onGiveLocationStar,
  isFollowed,
  onFollowLocation,
  onClickLocationTitle,
  onClose,
  reviews,
  canEditReview,
  onAddReview,
  onEditReview,
}: Props) {
  if (!open || !location) return null;

  const reviewList: Review[] = reviews ?? [];

  const { title, summary, address, website, imageUrl } = location as any;
  const countryCode = (location as any).countryCode;
  const postalCode = (location as any).postalCode;
  const verifiedByOwner = (location as any).verifiedByOwner;

  // 🔍 Lightbox for main image + review images
  const [previewImage, setPreviewImage] = React.useState<{
    url: string;
    alt: string;
  } | null>(null);

  return (
    <>
      <div
        className={`${
          variant === 'center' ? 'mx-auto' : ''
        } w-full max-w-3xl overflow-hidden rounded-2xl border border-neutral-800 bg-black/95 shadow-2xl backdrop-blur`}
      >
        {/* HEADER */}
        <div className="flex items-start justify-between gap-3 border-b border-neutral-800 px-4 py-3">
          <div className="min-w-0 flex-1">
            <button
              type="button"
              onClick={onClickLocationTitle}
              className="line-clamp-1 text-left text-base font-semibold text-white hover:underline"
            >
              {title}
            </button>

            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-100">
                <MapPin size={11} />
                Haunted location
              </span>

              {verifiedByOwner && (
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/70 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-emerald-200">
                  <span className="inline-block h-2 w-2 rounded-full bg-emerald-300" />
                  Verified by owner
                </span>
              )}

              {(countryCode || postalCode) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-200">
                  {countryCode && <span>{countryCode}</span>}
                  {countryCode && postalCode && <span>•</span>}
                  {postalCode && <span>{postalCode}</span>}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2">
            {/* Stars */}
            <button
              type="button"
              onClick={() => onGiveLocationStar(location.id)}
              className="inline-flex items-center gap-1 rounded-full border border-yellow-600/70 bg-yellow-500/10 px-2 py-0.5 text-[11px] font-semibold text-yellow-200 hover:bg-yellow-500/20"
            >
              <Star size={12} className="fill-yellow-300 text-yellow-300" />
              <span>{starCount}</span>
              <span>{starCount === 1 ? 'star' : 'stars'}</span>
            </button>

            {/* Added / Add location */}
            <button
              type="button"
              onClick={() => onFollowLocation(location.id)}
              className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] ${
                isFollowed
                  ? 'border-cyan-500/70 bg-cyan-500/15 text-cyan-100'
                  : 'border-cyan-500/50 bg-cyan-500/5 text-cyan-200 hover:bg-cyan-500/15'
              }`}
            >
              {isFollowed ? 'Added location' : 'Add location'}
            </button>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-neutral-700 bg-neutral-900/80 p-1 text-neutral-300 hover:bg-neutral-800"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* MAIN IMAGE (clickable for zoom) */}
        {imageUrl && (
          <button
            type="button"
            onClick={() =>
              setPreviewImage({
                url: imageUrl,
                alt: title || 'Location image',
              })
            }
            className="block w-full border-b border-neutral-800 bg-black cursor-pointer"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={title}
              className="max-h-[320px] w-full object-cover"
            />
          </button>
        )}

        {/* BODY */}
        <div className="max-h-[380px] space-y-4 overflow-y-auto px-4 py-3 text-sm">
          {/* Summary / description */}
          {summary && (
            <p className="whitespace-pre-line text-[13px] leading-relaxed text-neutral-200">
              {summary}
            </p>
          )}

          {/* Contact + site */}
          {(address || website) && (
            <div className="space-y-1 text-[12px] text-neutral-300">
              {address && (
                <div>
                  <span className="font-semibold text-neutral-100">
                    Contact:{' '}
                  </span>
                  <span>{address}</span>
                </div>
              )}
              {website && (
                <div>
                  <span className="font-semibold text-neutral-100">
                    Website:{' '}
                  </span>
                  <a
                    href={website}
                    target="_blank"
                    rel="noreferrer"
                    className="break-all text-cyan-300 hover:underline"
                  >
                    {website}
                  </a>
                </div>
              )}
            </div>
          )}

          {/* REVIEWS SECTION */}
          <div className="mt-2 border-t border-neutral-800 pt-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2 text-[12px] text-neutral-200">
                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-800/80 px-2 py-0.5 text-[11px]">
                  ★ {starCount} {starCount === 1 ? 'star' : 'stars'}
                </span>
                <span className="text-neutral-400">
                  {reviewList.length === 0
                    ? 'No reviews yet'
                    : reviewList.length === 1
                    ? '1 review'
                    : `${reviewList.length} reviews`}
                </span>
              </div>

              <button
                type="button"
                onClick={onAddReview}
                className="inline-flex items-center gap-1 rounded-full border border-cyan-500/70 bg-cyan-500/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 hover:bg-cyan-500/20"
              >
                <span>+ Add review</span>
              </button>
            </div>

            {/* Review list inside drawer */}
            {reviewList.length > 0 && (
              <div className="space-y-2">
                {reviewList.map((r) => {
                  const canEdit = canEditReview ? canEditReview(r) : false;

                  return (
                    <div
                      key={r.id}
                      className="flex items-start gap-2 rounded-md bg-neutral-950/70 px-2 py-1.5"
                    >
                      {/* Avatar stub */}
                      <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-neutral-800 text-xs text-neutral-200">
                        <UserIcon size={14} className="text-neutral-300" />
                      </div>

                      {/* Review image thumbnail (left of text) */}
                      {r.imageUrl && (
                        <button
                          type="button"
                          onClick={() =>
                            setPreviewImage({
                              url: r.imageUrl!,
                              alt: `Review by ${r.authorName}`,
                            })
                          }
                          className="mt-0.5 h-16 w-16 flex-shrink-0 overflow-hidden rounded-[6px] border border-neutral-800 bg-neutral-900 cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={r.imageUrl}
                            alt={`Review by ${r.authorName}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      )}

                      {/* Text + meta */}
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold text-neutral-100">
                            {r.authorName}
                          </span>
                          <span className="text-[10px] text-neutral-500">
                            {formatShortDate(r.createdAt)}
                          </span>
                        </div>

                        {r.text && (
                          <p className="mt-0.5 text-[11px] text-neutral-200">
                            {r.text}
                          </p>
                        )}

                        {canEdit && (
                          <button
                            type="button"
                            onClick={() => onEditReview(r.id)}
                            className="mt-0.5 text-[10px] text-neutral-400 hover:text-neutral-200"
                          >
                            Edit review
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 🖼 LIGHTBOX OVERLAY FOR LOCATION / REVIEW IMAGES */}
      {previewImage && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div className="relative max-h-[90vh] max-w-[90vw]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewImage.url}
              alt={previewImage.alt}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute right-2 top-2 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-neutral-100 hover:bg-black/90"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}


