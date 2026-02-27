"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toggleBookmark } from "../action";
import { useToast } from "@/components/Toast";

interface BookmarkButtonProps {
    threadId: string;
    initialBookmarked: boolean;
    isLoggedIn: boolean;
}

export default function BookmarkButton({ threadId, initialBookmarked, isLoggedIn }: BookmarkButtonProps) {
    const [bookmarked, setBookmarked] = useState(initialBookmarked);
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const handleToggle = async () => {
        if (!isLoggedIn) {
            router.push("/login");
            return;
        }

        if (isLoading) return;

        // Optimistic update
        const prev = bookmarked;
        setBookmarked(!prev);
        setIsLoading(true);

        const result = await toggleBookmark(threadId);

        if (result.error) {
            setBookmarked(prev);
            toast.error(result.error);
        } else if (result.success) {
            setBookmarked(result.bookmarked);
            toast.info(result.bookmarked ? "Thread saved" : "Thread unsaved");
        }

        setIsLoading(false);
    };

    return (
        <button
            onClick={handleToggle}
            className={`p-2 rounded-lg transition-colors ${bookmarked
                    ? "text-yellow-400 hover:bg-yellow-500/10"
                    : "text-neutral-500 hover:text-yellow-400 hover:bg-white/5"
                }`}
            title={bookmarked ? "Remove bookmark" : "Bookmark thread"}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill={bookmarked ? "currentColor" : "none"}
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            >
                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
            </svg>
        </button>
    );
}
