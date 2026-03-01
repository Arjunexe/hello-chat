"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { joinQueue, leaveQueue } from "./actions";
import { supabase } from "@/lib/supabase";

interface MatchmakingClientProps {
    currentUserId: string;
}

export default function MatchmakingClient({ currentUserId }: MatchmakingClientProps) {
    const [status, setStatus] = useState<"idle" | "searching" | "matched">("idle");
    const [matchedSessionId, setMatchedSessionId] = useState<string | null>(null);
    const [searchTime, setSearchTime] = useState(0);
    const router = useRouter();
    const searchParams = useSearchParams();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const autoStarted = useRef(false);

    // Auto-start searching if coming from a skip
    useEffect(() => {
        if (searchParams.get("autostart") === "true" && !autoStarted.current && status === "idle") {
            autoStarted.current = true;
            handleStart();
        }
    }, [searchParams]);

    // Search timer
    useEffect(() => {
        if (status === "searching") {
            timerRef.current = setInterval(() => {
                setSearchTime((prev) => prev + 1);
            }, 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
            setSearchTime(0);
        }
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [status]);

    // Listen for being matched (when someone else creates a session with us)
    useEffect(() => {
        if (status !== "searching") return;

        const channel = supabase
            .channel("dm-match-listener")
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "dm_sessions",
                },
                (payload) => {
                    const session = payload.new as any;
                    if (
                        session.user1_id === currentUserId ||
                        session.user2_id === currentUserId
                    ) {
                        setMatchedSessionId(session.id);
                        setStatus("matched");
                    }
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [status, currentUserId]);

    // Redirect on match
    useEffect(() => {
        if (status === "matched" && matchedSessionId) {
            const timer = setTimeout(() => {
                router.push(`/chat/${matchedSessionId}`);
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, [status, matchedSessionId, router]);

    async function handleStart() {
        setStatus("searching");
        try {
            const result = await joinQueue();
            if (result.sessionId) {
                // Matched immediately!
                setMatchedSessionId(result.sessionId);
                setStatus("matched");
            }
            // Otherwise, we're in the queue and waiting
        } catch (err) {
            console.error(err);
            setStatus("idle");
        }
    }

    async function handleCancel() {
        setStatus("idle");
        try {
            await leaveQueue();
        } catch (err) {
            console.error(err);
        }
    }

    function formatSearchTime(seconds: number) {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, "0")}`;
    }

    // IDLE STATE
    if (status === "idle") {
        return (
            <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Icon */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                            <circle cx="9" cy="7" r="4" />
                            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                        <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse" />
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-xl font-bold text-white mb-2">Random 1v1 Chat</h2>
                    <p className="text-neutral-400 text-sm max-w-sm">
                        Get matched with a random stranger for a one-on-one conversation. Meet new people and have unexpected chats.
                    </p>
                </div>

                <button
                    onClick={handleStart}
                    className="group relative px-8 py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold text-sm transition-all duration-300 hover:shadow-xl hover:shadow-purple-600/25 hover:scale-[1.02] active:scale-[0.98]"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        Start Chatting
                    </span>
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
            </div>
        );
    }

    // SEARCHING STATE
    if (status === "searching") {
        return (
            <div className="w-full max-w-md flex flex-col items-center gap-8">
                {/* Animated searching indicator */}
                <div className="relative">
                    <div className="w-24 h-24 rounded-full border-2 border-purple-500/30 flex items-center justify-center">
                        <div className="w-20 h-20 rounded-full border-2 border-purple-500/50 border-t-purple-400 animate-spin" />
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-300">
                            <circle cx="11" cy="11" r="8" />
                            <line x1="21" y1="21" x2="16.65" y2="16.65" />
                        </svg>
                    </div>
                </div>

                <div className="text-center">
                    <h2 className="text-lg font-bold text-white mb-2">Looking for someone...</h2>
                    <p className="text-neutral-500 text-sm">
                        Searching for {formatSearchTime(searchTime)}
                    </p>
                </div>

                {/* Animated dots */}
                <div className="flex gap-2">
                    {[0, 1, 2].map((i) => (
                        <div
                            key={i}
                            className="w-2.5 h-2.5 rounded-full bg-purple-500"
                            style={{
                                animation: `pulse 1.5s ease-in-out ${i * 0.3}s infinite`,
                                opacity: 0.3,
                            }}
                        />
                    ))}
                </div>

                <button
                    onClick={handleCancel}
                    className="px-6 py-2 rounded-xl text-sm text-neutral-400 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
                >
                    Cancel
                </button>

                <style jsx>{`
                    @keyframes pulse {
                        0%, 100% { opacity: 0.3; transform: scale(1); }
                        50% { opacity: 1; transform: scale(1.3); }
                    }
                `}</style>
            </div>
        );
    }

    // MATCHED STATE
    return (
        <div className="w-full max-w-md flex flex-col items-center gap-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-green-600/30 to-emerald-600/30 border border-green-500/30 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-400">
                        <polyline points="20 6 9 17 4 12" />
                    </svg>
                </div>
            </div>

            <div className="text-center">
                <h2 className="text-xl font-bold text-green-300 mb-2">Match Found!</h2>
                <p className="text-neutral-400 text-sm">
                    Connecting you now...
                </p>
            </div>

            <div className="flex gap-2">
                {[0, 1, 2].map((i) => (
                    <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-green-400"
                        style={{
                            animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
                        }}
                    />
                ))}
            </div>

            <style jsx>{`
                @keyframes pulse {
                    0%, 100% { opacity: 0.3; transform: scale(1); }
                    50% { opacity: 1; transform: scale(1.3); }
                }
            `}</style>
        </div>
    );
}
