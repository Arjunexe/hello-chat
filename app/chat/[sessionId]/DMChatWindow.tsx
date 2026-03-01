"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { sendDM, loadOlderDMs, endSession } from "../actions";
import { useRouter } from "next/navigation";
import MentionText from "@/components/MentionText";

interface Message {
    id: string;
    session_id: string;
    user_id: string;
    username: string;
    content: string;
    created_at: string;
}

interface DMChatWindowProps {
    sessionId: string;
    partnerUsername: string;
    initialMessages: Message[];
    currentUserId: string;
    currentUsername: string;
    totalMessageCount: number;
}

const PAGE_SIZE = 50;

export default function DMChatWindow({
    sessionId,
    partnerUsername,
    initialMessages,
    currentUserId,
    currentUsername,
    totalMessageCount,
}: DMChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMore, setHasMore] = useState(totalMessageCount > initialMessages.length);
    const [sessionEnded, setSessionEnded] = useState(false);
    const [isEnding, setIsEnding] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const scrollToBottom = useCallback((smooth = true) => {
        messagesEndRef.current?.scrollIntoView({
            behavior: smooth ? "smooth" : "instant",
        });
    }, []);

    useEffect(() => {
        scrollToBottom(true);
    }, [messages.length, scrollToBottom]);

    useEffect(() => {
        scrollToBottom(false);
    }, [scrollToBottom]);

    // Subscribe to new messages
    useEffect(() => {
        const channel = supabase
            .channel(`dm-${sessionId}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "dm_messages",
                    filter: `session_id=eq.${sessionId}`,
                },
                (payload) => {
                    const newMessage = payload.new as Message;
                    setMessages((prev) => {
                        if (prev.some((m) => m.id === newMessage.id)) return prev;
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
    }, [sessionId]);

    // Subscribe to session status changes (detect when partner ends chat)
    useEffect(() => {
        const channel = supabase
            .channel(`dm-session-status-${sessionId}`)
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "dm_sessions",
                    filter: `id=eq.${sessionId}`,
                },
                (payload) => {
                    const updated = payload.new as any;
                    if (updated.status === "ended") {
                        setSessionEnded(true);
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [sessionId]);

    // Escape key to skip
    useEffect(() => {
        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape" && !sessionEnded && !isEnding) {
                handleSkip();
            }
        }
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [sessionEnded, isEnding]);

    async function handleLoadMore() {
        if (isLoadingMore || !hasMore || messages.length === 0) return;
        setIsLoadingMore(true);

        const container = scrollContainerRef.current;
        const previousScrollHeight = container?.scrollHeight || 0;

        try {
            const olderMessages = await loadOlderDMs(sessionId, messages[0].created_at, PAGE_SIZE);
            if (olderMessages.length < PAGE_SIZE) setHasMore(false);
            if (olderMessages.length > 0) {
                setMessages((prev) => [...olderMessages, ...prev]);
                requestAnimationFrame(() => {
                    if (container) {
                        container.scrollTop = container.scrollHeight - previousScrollHeight;
                    }
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingMore(false);
        }
    }

    async function handleSend(e: React.FormEvent) {
        e.preventDefault();
        if (!input.trim() || isSending || sessionEnded) return;

        const messageContent = input.trim();
        setInput("");
        setIsSending(true);

        const optimisticMessage: Message = {
            id: `temp-${Date.now()}`,
            session_id: sessionId,
            user_id: currentUserId,
            username: currentUsername,
            content: messageContent,
            created_at: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, optimisticMessage]);

        try {
            await sendDM(sessionId, messageContent);
        } catch (err) {
            setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
            setInput(messageContent);
            console.error(err);
        } finally {
            setIsSending(false);
            inputRef.current?.focus();
        }
    }

    async function handleEndChat() {
        if (isEnding) return;
        setIsEnding(true);
        try {
            await endSession(sessionId);
            setSessionEnded(true);
        } catch (err) {
            console.error(err);
            setIsEnding(false);
        }
    }

    async function handleSkip() {
        if (isEnding) return;
        setIsEnding(true);
        try {
            await endSession(sessionId);
            // Redirect with autostart to immediately re-queue
            router.push("/chat?autostart=true");
        } catch (err) {
            console.error(err);
            setIsEnding(false);
        }
    }

    function formatTime(dateStr: string) {
        return new Date(dateStr).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
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
        <div className="flex flex-col h-[calc(100dvh-200px)] sm:h-[calc(100vh-180px)] sm:max-h-[700px]">
            {/* Session ended overlay */}
            {sessionEnded && (
                <div className="absolute inset-0 z-10 bg-black/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-neutral-800 border border-white/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-400">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="15" y1="9" x2="9" y2="15" />
                            <line x1="9" y1="9" x2="15" y2="15" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-bold text-white">Chat Ended</h3>
                    <p className="text-neutral-400 text-sm">This conversation has ended.</p>
                    <div className="flex gap-3 mt-2">
                        <button
                            onClick={() => router.push("/chat?autostart=true")}
                            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-purple-600/25 transition-all"
                        >
                            Find Someone New
                        </button>
                        <button
                            onClick={() => router.push("/chat")}
                            className="px-5 py-2.5 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                        >
                            Back to Home
                        </button>
                    </div>
                </div>
            )}

            {/* Messages */}
            <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto px-1 py-4 space-y-1"
            >
                {hasMore && (
                    <div className="flex justify-center pb-4">
                        <button
                            onClick={handleLoadMore}
                            disabled={isLoadingMore}
                            className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-neutral-400 text-xs hover:bg-white/10 hover:text-white transition-all disabled:opacity-50"
                        >
                            {isLoadingMore ? (
                                <>
                                    <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Loading...
                                </>
                            ) : (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
                                    Load older messages
                                </>
                            )}
                        </button>
                    </div>
                )}

                {messages.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-3 py-16 text-center">
                        <p className="text-neutral-500 text-sm">
                            You&apos;re now chatting with <span className="text-purple-400 font-medium">{partnerUsername}</span>. Say hi! 👋
                        </p>
                    </div>
                ) : (
                    messages.map((msg, i) => {
                        const isOwn = msg.user_id === currentUserId;
                        const showAvatar = i === 0 || messages[i - 1].user_id !== msg.user_id;

                        return (
                            <div key={msg.id} className={`flex gap-3 ${showAvatar ? "mt-4" : "mt-0.5"}`}>
                                <div className="w-8 shrink-0">
                                    {showAvatar && (
                                        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${getAvatarColor(msg.username)} flex items-center justify-center text-white text-xs font-bold shadow-md`}>
                                            {msg.username.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 min-w-0">
                                    {showAvatar && (
                                        <div className="flex items-baseline gap-2 mb-0.5">
                                            <span className={`text-xs font-semibold ${isOwn ? "text-purple-300" : "text-neutral-300"}`}>
                                                {isOwn ? "You" : msg.username}
                                            </span>
                                            <span className="text-[10px] text-neutral-600">{formatTime(msg.created_at)}</span>
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
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input bar + controls */}
            {!sessionEnded && (
                <div className="shrink-0 pt-3 border-t border-white/5 space-y-2">
                    <form onSubmit={handleSend}>
                        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-neutral-900/80 border border-white/10 focus-within:border-purple-500/30 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                maxLength={1000}
                                className="flex-1 bg-transparent px-3 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none"
                                disabled={isSending}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isSending}
                                className="shrink-0 p-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    </form>

                    {/* Skip control */}
                    <div className="flex items-center justify-center">
                        <button
                            onClick={handleSkip}
                            disabled={isEnding}
                            className="flex items-center gap-2 px-5 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-neutral-300 hover:text-white hover:bg-red-500/15 hover:border-red-500/30 transition-all disabled:opacity-50"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polygon points="5 4 15 12 5 20 5 4" />
                                <line x1="19" y1="5" x2="19" y2="19" />
                            </svg>
                            {isEnding ? "Skipping..." : "Skip"}
                            <span className="text-neutral-500 text-[10px] ml-1 border border-white/10 rounded px-1.5 py-0.5">Esc</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
