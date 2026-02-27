"use client";

import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { deleteThreadAction, toggleLikeAction, toggleBookmark } from "./action";
import { useToast } from "@/components/Toast";
import ImageLightbox from "@/components/ImageLightbox";

type Thread = {
  id: string;
  author: string;
  authorId?: string | null;
  title: string;
  content?: string;
  image?: string | null;
  likedBy?: string[];
  likeCount?: number;
  createdAt?: string;
};

type ThreadCardProps = {
  thread: Thread;
  currentUserId?: string | null;
  isBookmarked?: boolean;
  isLoggedIn?: boolean;
};

export default function ThreadCard({ thread, currentUserId, isBookmarked: initialBookmarked = false, isLoggedIn = false }: ThreadCardProps) {
  const router = useRouter();
  const toast = useToast();

  // Initialize liked state based on whether currentUserId is in likedBy array
  const initialLiked = currentUserId ? (thread.likedBy || []).includes(currentUserId) : false;
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(thread.likeCount || 0);
  const [isLiking, setIsLiking] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [bookmarked, setBookmarked] = useState(initialBookmarked);
  const [isBookmarking, setIsBookmarking] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const isAuthor = currentUserId && thread.authorId && currentUserId === thread.authorId;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleLike = async () => {
    // Redirect guests to login
    if (!currentUserId) {
      router.push("/login");
      return;
    }

    if (isLiking) return;

    // Optimistic update
    const wasLiked = liked;
    const prevCount = likeCount;
    setLiked(!wasLiked);
    setLikeCount(wasLiked ? prevCount - 1 : prevCount + 1);
    setIsLiking(true);

    const result = await toggleLikeAction(thread.id);

    if (result.error) {
      // Revert on error
      setLiked(wasLiked);
      setLikeCount(prevCount);
      toast.error(result.error);
    } else if (result.success) {
      // Sync with server response
      setLiked(result.liked);
      setLikeCount(result.likeCount);
    }

    setIsLiking(false);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteThreadAction(thread.id);
    if (result.error) {
      toast.error(result.error);
      setIsDeleting(false);
      setShowConfirm(false);
    }
    // On success, the page will revalidate and remove the thread
  };

  const handleShare = async () => {
    const url = `${window.location.origin}/thread/${thread.id}`;

    // Try native share API first (mobile)
    if (navigator.share) {
      try {
        await navigator.share({
          title: thread.title,
          text: `Check out this thread on All-Chat: ${thread.title}`,
          url: url,
        });
        return;
      } catch (err) {
        // User cancelled or share failed, fall through to copy
      }
    }

    // Fallback to clipboard copy
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Format relative time
  const formatTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <>
      {/* Delete Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Post?</h3>
            <p className="text-neutral-400 text-sm mb-6">
              This action cannot be undone. All comments on this thread will also be deleted.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="group relative w-full rounded-2xl border border-white/25 bg-white/5 backdrop-blur-lg overflow-hidden transition-all hover:border-purple-500/40">
        {/* --- MAIN PADDING CONTAINER --- */}
        <Link href={`/thread/${thread.id}`} className="block cursor-pointer">
          <div className="p-5 pb-3">
            {/* ROW 1: HEADER */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-lg text-white font-medium">
                  @{thread.author}
                </span>
                <span className="text-xs text-neutral-500">
                  · {formatTime(thread.createdAt)}
                </span>
              </div>
            </div>

            {/* ROW 2: CONTENT */}
            <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg md:text-xl font-semibold text-white leading-snug">
                  {thread.title}
                </h3>
                {thread.content && (
                  <p className="text-neutral-400 text-sm mt-2 line-clamp-2">
                    {thread.content}
                  </p>
                )}
              </div>

              {thread.image && (
                <div
                  className="shrink-0 w-full md:w-32 cursor-zoom-in"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setLightboxOpen(true);
                  }}
                >
                  <img
                    src={thread.image}
                    alt="Topic attachment"
                    className="w-full h-48 md:h-32 rounded-xl object-cover border border-white/10 bg-white/5 hover:border-purple-500/40 transition-colors"
                  />
                </div>
              )}
            </div>
          </div>
        </Link>

        {/* More Options Button - positioned absolute */}
        {isAuthor && (
          <div className="absolute top-3 right-3" ref={menuRef}>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="text-neutral-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <MoreVerticalIcon className="w-5 h-5" />
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-36 bg-neutral-900 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50">
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowConfirm(true);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-red-400 hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <TrashIcon className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}

        {/* --- INTERACTIVE FOOTER --- */}
        <div className="bg-black/20 px-4 py-2 flex items-center gap-2 border-t border-white/5">
          {/* LIKE BUTTON */}
          <button
            onClick={toggleLike}
            className="group/like flex items-center justify-start w-16 gap-1.5 transition-colors shrink-0 p-2 rounded-lg hover:bg-white/5"
          >
            <HeartIcon
              filled={liked}
              className={`w-4 h-4 transition-transform duration-300 ${liked ? "scale-110 text-pink-500" : "text-white/60 group-hover/like:text-pink-400"}`}
            />
            <span
              className={`text-xs font-medium ${liked ? "text-pink-400" : "text-neutral-400 group-hover/like:text-neutral-200"}`}
            >
              {likeCount || "Like"}
            </span>
          </button>

          {/* COMMENT BUTTON */}
          <Link
            href={`/thread/${thread.id}`}
            className="group/comment flex items-center justify-start w-16 gap-1.5 transition-colors shrink-0 p-2 rounded-lg hover:bg-white/5"
          >
            <MessageIcon className="w-5 h-5 text-white/60 group-hover/comment:text-purple-400" />
            <span className="text-xs font-medium text-neutral-400 group-hover/comment:text-neutral-200">
              Reply
            </span>
          </Link>

          {/* SHARE BUTTON */}
          <button
            onClick={handleShare}
            className="group/share flex items-center justify-start w-16 gap-1.5 transition-colors shrink-0 p-2 rounded-lg hover:bg-white/5"
          >
            {copied ? (
              <>
                <CheckIcon className="w-4 h-4 text-green-400" />
                <span className="text-xs font-medium text-green-400">Copied</span>
              </>
            ) : (
              <>
                <ShareIcon className="w-4 h-4 text-white/60 group-hover/share:text-blue-400" />
                <span className="text-xs font-medium text-neutral-400 group-hover/share:text-neutral-200">
                  Share
                </span>
              </>
            )}
          </button>

          {/* BOOKMARK BUTTON */}
          <button
            onClick={async () => {
              if (!isLoggedIn) {
                toast.info("Login to bookmark threads");
                return;
              }
              if (isBookmarking) return;
              const prev = bookmarked;
              setBookmarked(!prev);
              setIsBookmarking(true);
              const result = await toggleBookmark(thread.id);
              if (result.error) {
                setBookmarked(prev);
                toast.error(result.error);
              } else if (result.success) {
                setBookmarked(result.bookmarked);
              }
              setIsBookmarking(false);
            }}
            className={`group/save flex items-center gap-1.5 p-2 rounded-lg hover:bg-white/5 transition-colors ml-auto ${bookmarked ? 'text-yellow-400' : ''}`}
          >
            <BookmarkIcon filled={bookmarked} className={`w-4 h-4 transition-transform ${bookmarked ? 'text-yellow-400' : 'text-white/60 group-hover/save:text-yellow-400'}`} />
          </button>
        </div>
      </div>

      {/* Image Lightbox */}
      {lightboxOpen && thread.image && (
        <ImageLightbox
          src={thread.image}
          alt={thread.title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </>
  );
}

// --- ICONS ---

function MessageIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="2 2 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
    </svg>
  );
}

function HeartIcon({
  className,
  filled,
}: {
  className?: string;
  filled: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    </svg>
  );
}

function MoreVerticalIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function TrashIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" y1="11" x2="10" y2="17" />
      <line x1="14" y1="11" x2="14" y2="17" />
    </svg>
  );
}

function ShareIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function BookmarkIcon({
  className,
  filled,
}: {
  className?: string;
  filled: boolean;
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
    </svg>
  );
}
