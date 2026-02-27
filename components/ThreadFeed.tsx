"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getThreadsPaginated } from "@/app/thread/action";
import ThreadCard from "@/app/thread/ThreadCard";

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

interface ThreadFeedProps {
    initialThreads: Thread[];
    initialNextCursor: string | null;
    initialHasMore: boolean;
    currentUserId: string | null;
    bookmarkIds?: string[];
    isLoggedIn?: boolean;
}

export default function ThreadFeed({
    initialThreads,
    initialNextCursor,
    initialHasMore,
    currentUserId,
    bookmarkIds = [],
    isLoggedIn = false,
}: ThreadFeedProps) {
    const [threads, setThreads] = useState<Thread[]>(initialThreads);
    const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
    const [hasMore, setHasMore] = useState(initialHasMore);
    const [isLoading, setIsLoading] = useState(false);
    const sentinelRef = useRef<HTMLDivElement>(null);

    // Reset when initial data changes (e.g., after creating a new thread)
    useEffect(() => {
        setThreads(initialThreads);
        setNextCursor(initialNextCursor);
        setHasMore(initialHasMore);
    }, [initialThreads, initialNextCursor, initialHasMore]);

    const loadMore = useCallback(async () => {
        if (isLoading || !hasMore || !nextCursor) return;

        setIsLoading(true);
        try {
            const result = await getThreadsPaginated(nextCursor);
            setThreads((prev) => [...prev, ...result.threads]);
            setNextCursor(result.nextCursor);
            setHasMore(result.hasMore);
        } catch (error) {
            console.error("Error loading more threads:", error);
        } finally {
            setIsLoading(false);
        }
    }, [isLoading, hasMore, nextCursor]);

    // Intersection Observer for infinite scroll
    useEffect(() => {
        const sentinel = sentinelRef.current;
        if (!sentinel) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && hasMore && !isLoading) {
                    loadMore();
                }
            },
            { rootMargin: "200px" }
        );

        observer.observe(sentinel);
        return () => observer.disconnect();
    }, [hasMore, isLoading, loadMore]);

    if (threads.length === 0) {
        return (
            <div className="text-center py-12 text-neutral-500">
                <p className="text-lg">No threads yet</p>
                <p className="text-sm mt-2">Be the first to start a conversation!</p>
            </div>
        );
    }

    return (
        <>
            {threads.map((thread) => (
                <ThreadCard
                    key={thread.id}
                    thread={thread}
                    currentUserId={currentUserId}
                    isBookmarked={bookmarkIds.includes(thread.id)}
                    isLoggedIn={isLoggedIn}
                />
            ))}

            {/* Loading spinner */}
            {isLoading && (
                <div className="flex justify-center py-6">
                    <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}

            {/* Sentinel for intersection observer */}
            {hasMore && <div ref={sentinelRef} className="h-4" />}

            {/* End of feed */}
            {!hasMore && threads.length > 0 && (
                <p className="text-center text-neutral-600 text-sm py-6">
                    You&apos;ve reached the end ✨
                </p>
            )}
        </>
    );
}
