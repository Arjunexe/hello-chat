"use client";

import { useState } from "react";
import { type CommentNode } from "../action";
import CommentForm from "./CommentForm";
import MentionText from "@/components/MentionText";

interface CommentItemProps {
    comment: CommentNode;
    threadId: string;
    isLoggedIn: boolean;
    depth?: number;
}

const MAX_DEPTH = 4;

// Depth-based colors for the threading lines (like Reddit's colorful lines)
const THREAD_COLORS = [
    "border-purple-500/50 hover:border-purple-400",
    "border-blue-500/50 hover:border-blue-400",
    "border-pink-500/50 hover:border-pink-400",
    "border-cyan-500/50 hover:border-cyan-400",
    "border-amber-500/50 hover:border-amber-400",
];

export default function CommentItem({ comment, threadId, isLoggedIn, depth = 0 }: CommentItemProps) {
    const [showReplyForm, setShowReplyForm] = useState(false);
    const [collapsed, setCollapsed] = useState(false);

    const threadColor = THREAD_COLORS[depth % THREAD_COLORS.length];

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return "Just now";
        if (diffMins < 60) return `${diffMins}m`;
        if (diffHours < 24) return `${diffHours}h`;
        if (diffDays < 7) return `${diffDays}d`;
        return date.toLocaleDateString();
    };

    return (
        <div className="group/thread">
            {/* The comment itself */}
            <div className="flex gap-3">
                {/* Avatar */}
                <div className="flex flex-col items-center shrink-0">
                    <div className="w-7 h-7 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 text-xs font-bold shrink-0">
                        {comment.user[0].toUpperCase()}
                    </div>
                    {/* Threading line extending down from avatar (only if has children or reply is open) */}
                    {(comment.children.length > 0 || showReplyForm) && !collapsed && (
                        <button
                            onClick={() => setCollapsed(true)}
                            className={`w-0 flex-1 mt-1 border-l-2 ${threadColor} transition-colors cursor-pointer`}
                            title="Collapse thread"
                        />
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-2">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-purple-400 text-xs">
                            @{comment.user}
                        </span>
                        <span className="text-[10px] text-neutral-600">·</span>
                        <span className="text-[10px] text-neutral-600">
                            {formatTime(comment.createdAt)}
                        </span>
                        {collapsed && (
                            <button
                                onClick={() => setCollapsed(false)}
                                className="text-[10px] text-neutral-500 hover:text-purple-400 transition-colors ml-1"
                            >
                                [+{comment.children.length} {comment.children.length === 1 ? "reply" : "replies"}]
                            </button>
                        )}
                    </div>

                    {/* Comment text with mentions highlighted */}
                    <MentionText text={comment.text} className="text-neutral-300 text-sm leading-relaxed" />

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-1.5">
                        {isLoggedIn && depth < MAX_DEPTH && (
                            <button
                                onClick={() => setShowReplyForm(!showReplyForm)}
                                className="text-[11px] text-neutral-500 hover:text-purple-400 transition-colors flex items-center gap-1 font-medium"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="9 17 4 12 9 7" />
                                    <path d="M20 18v-2a4 4 0 0 0-4-4H4" />
                                </svg>
                                {showReplyForm ? "Cancel" : "Reply"}
                            </button>
                        )}
                    </div>

                    {/* Inline reply form */}
                    {showReplyForm && (
                        <div className="mt-2">
                            <CommentForm
                                threadId={threadId}
                                isLoggedIn={isLoggedIn}
                                parentId={comment.id}
                                onCancel={() => setShowReplyForm(false)}
                                isReply
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested children with threading line */}
            {!collapsed && comment.children.length > 0 && (
                <div className="ml-[13px]">
                    {/* Each child is wrapped with "thread line on the left" */}
                    {comment.children.map((child, index) => (
                        <div key={child.id} className="flex">
                            {/* The vertical thread line */}
                            <button
                                onClick={() => setCollapsed(true)}
                                className={`w-0 shrink-0 border-l-2 ${threadColor} transition-colors cursor-pointer mr-[18px]`}
                                title="Collapse thread"
                            />
                            {/* The nested comment */}
                            <div className="flex-1 min-w-0 mt-1">
                                <CommentItem
                                    comment={child}
                                    threadId={threadId}
                                    isLoggedIn={isLoggedIn}
                                    depth={depth + 1}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
