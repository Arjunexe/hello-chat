"use client";

import { deleteChatroom } from "./actions";
import { useState } from "react";

interface DeleteChatroomButtonProps {
    chatroomId: string;
    currentUserId: string;
    createdBy: string;
}

export default function DeleteChatroomButton({ chatroomId, currentUserId, createdBy }: DeleteChatroomButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);

    if (currentUserId !== createdBy) return null;

    async function handleDelete(e: React.MouseEvent) {
        e.preventDefault();
        e.stopPropagation();

        if (!confirm("Delete this chatroom? All messages will be lost.")) return;

        setIsDeleting(true);
        try {
            await deleteChatroom(chatroomId);
        } catch (err) {
            console.error(err);
            setIsDeleting(false);
        }
    }

    return (
        <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
            title="Delete chatroom"
        >
            {isDeleting ? (
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
            ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
            )}
        </button>
    );
}
