"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { sendMessage, loadOlderMessages } from "./actions";
import MentionInput from "@/components/MentionInput";
import MentionText from "@/components/MentionText";

interface Message {
    id: string;
    chatroom_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

interface ChatWindowProps {
    chatroomId: string;
    initialMessages: Message[];
    currentUserId: string | null;
    currentUsername: string | null;
    totalMessageCount: number;
}

const PAGE_SIZE = 50;

export default function ChatWindow({
    chatroomId,
    initialMessages,
    currentUserId,
    currentUsername,
    totalMessageCount,
}: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(totalMessageCount > initialMessages.length);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    }, []);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom(true);
    }, [messages.length, scrollToBottom]);

    // Initial scroll
    useEffect(() => {
        scrollToBottom(false);
    }, [scrollToBottom]);

    // Subscribe to Supabase Realtime
    useEffect(() => {
        const channel = supabase
            .channel(`chatroom-${chatroomId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "messages",
                    filter: `chatroom_id=eq.${chatroomId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => {
                        // Avoid exact duplicates
                        if (prev.some((m) => m.id === newMessage.id)) return prev;
                        // Replace optimistic temp message with the real one
                        const tempIndex = prev.findIndex(
                            (m) =>
                                m.id.startsWith("temp-") &&
                                m.user_id === newMessage.user_id &&
                                m.content === newMessage.content
                        );
                        if (tempIndex !== -1) {
                            const updated = [...prev];
                            updated[tempIndex] = newMessage;
                            return updated;
                        }
                        return [...prev, newMessage];
                    });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [chatroomId]);

    // Load older messages
    async function handleLoadMore() {
        if (isLoadingMore || !hasMore || messages.length === 0) return;
        setIsLoadingMore(true);

        const container = scrollContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        try {
            const oldestMessage = messages[0];
            const olderMessages = await loadOlderMessages(chatroomId, oldestMessage.created_at, PAGE_SIZE);

            if (olderMessages.length < PAGE_SIZE) {
                setHasMore(false);
            }

            if (olderMessages.length > 0) {
                setMessages((prev) => [...olderMessages, ...prev]);

                // Preserve scroll position after prepending
                requestAnimationFrame(() => {
                    if (container) {
                        const newScrollHeight = container.scrollHeight;
                        container.scrollTop = newScrollHeight - previousScrollHeight;
                    }
                });
            }
        } catch (err) {
            console.error("Failed to load older messages:", err);
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isSending || !currentUserId) return;

        const messageContent = input.trim();
        setInput("");
        setIsSending(true);

        // Optimistic update
        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            chatroom_id: chatroomId,
            user_id: currentUserId,
            username: currentUsername || "You",
            content: messageContent,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            await sendMessage(chatroomId, messageContent);
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            setInput(messageContent);
            console.error(err);
        } finally {
            setIsSending(false);
        }
    }

    function formatTime(dateStr: string) {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }

    function formatDateSeparator(dateStr: string) {
        const date = new Date(dateStr);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) return "Today";
        if (date.toDateString() === yesterday.toDateString()) return "Yesterday";
        return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
    }

    function shouldShowDateSeparator(i: number) {
        if (i === 0) return true;
        const prev = new Date(messages[i - 1].created_at).toDateString();
        const curr = new Date(messages[i].created_at).toDateString();
        return prev !== curr;
    }

    function getAvatarColor(username: string) {
        const colors = [
            "from-purple-500 to-pink-500",
            "from-blue-500 to-cyan-500",
            "from-green-500 to-emerald-500",
            "from-orange-500 to-amber-500",
            "from-rose-500 to-red-500",
            "from-indigo-500 to-violet-500",
            "from-teal-500 to-green-500",
            "from-fuchsia-500 to-purple-500",
        ];
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        return colors[Math.abs(hash) % colors.length];
    }

    return (
        <div className="flex flex-col h-[calc(100vh-180px)] max-h-[700px]">
            {/* Messages area */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-1 py-4 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            >
                {/* Load More button */}
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="18 15 12 9 6 15" />
                                    </svg>
                                    Load older messages
                                </>
                            )}
                        </button>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <div className="w-12 h-12 rounded-full bg-purple-600/15 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <p className="text-neutral-500 text-sm">No messages yet. Be the first to say something!</p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isOwn = msg.user_id === currentUserId;
                        const showAvatar =
                            i === 0 || messages[i - 1].user_id !== msg.user_id || shouldShowDateSeparator(i);
                        const showDate = shouldShowDateSeparator(i);

                        return (
                            <div key={msg.id}>
                                {/* Date separator */}
                                {showDate && (
                                    <div className="flex items-center gap-3 py-3 mt-2">
                                        <div className="flex-1 h-px bg-white/5" />
                                        <span className="text-[10px] text-neutral-500 font-medium uppercase tracking-wider">
                                            {formatDateSeparator(msg.created_at)}
                                        </span>
                                        <div className="flex-1 h-px bg-white/5" />
                                    </div>
                                )}

                                <div className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-0.5"}`}>
                                    {/* Avatar column */}
                                    <div className="w-8 shrink-0">
                                        {showAvatar && (
                                            <div
                                                className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.username)} flex items-center justify-center text-white text-xs font-bold shadow-md`}
                                            >
                                                {msg.username.charAt(0).toUpperCase()}
                                            </div>
                                        )}
                                    </div>

                                    {/* Message content */}
                                    <div className="flex-1 min-w-0">
                                        {showAvatar && (
                                            <div className="flex items-baseline gap-2 mb-0.5">
                                                <span className={`text-xs font-semibold ${isOwn ? "text-purple-300" : "text-neutral-300"}`}>
                                                    {isOwn ? "You" : msg.username}
                                                </span>
                                                <span className="text-[10px] text-neutral-600">
                                                    {formatTime(msg.created_at)}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`inline-block px-3 py-1.5 rounded-2xl text-sm leading-relaxed break-words max-w-[85%] ${isOwn
                                            ? "bg-purple-600/20 text-purple-100 border border-purple-500/10"
                                            : "bg-white/5 text-neutral-200 border border-white/5"
                                            } ${msg.id.startsWith("temp-") ? "opacity-60" : ""}`}>
                                            <MentionText text={msg.content} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar with MentionInput */}
            {currentUserId ? (
                <form onSubmit={handleSend} className="shrink-0 pt-3 border-t border-white/5">
                    <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 focus-within:border-purple-500/30 transition-all">
                        <MentionInput
                            value={input}
                            onChange={setInput}
                            placeholder="Type a message... (use @ to mention)"
                            className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                        />
                        <button
                            type="submit"
                            disabled={!input.trim() || isSending}
                            className="shrink-0 p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-purple-600"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13" />
                                <polygon points="22 2 15 22 11 13 2 9 22 2" />
                            </svg>
                        </button>
                    </div>
                </form>
            ) : (
                <div className="shrink-0 pt-3 border-t border-white/5">
                    <p className="text-center text-neutral-500 text-sm py-3">
                        <a href="/login" className="text-purple-400 hover:underline">Log in</a> to send messages
                    </p>
                </div>
            )}
        </div>
    );
}
