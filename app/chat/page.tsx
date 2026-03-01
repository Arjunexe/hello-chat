import PageShell from "@/components/PageShell";
import { auth } from "@/auth";
import { supabase } from "@/lib/supabase";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import MatchmakingClient from "./MatchmakingClient";

export default async function ChatPage() {
    const session = await auth();

    // If logged in, check for an active session and redirect
    if (session?.user?.id) {
        const { data: activeSession } = await supabase
            .from("dm_sessions")
            .select("id")
            .eq("status", "active")
            .or(`user1_id.eq.${session.user.id},user2_id.eq.${session.user.id}`)
            .limit(1)
            .maybeSingle();

        if (activeSession) {
            redirect(`/chat/${activeSession.id}`);
        }
    }

    return (
        <PageShell title="1v1 Chat">
            <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center gap-6">
                {session?.user?.id ? (
                    <Suspense fallback={<div className="text-neutral-500 text-sm">Loading...</div>}>
                        <MatchmakingClient currentUserId={session.user.id} />
                    </Suspense>
                ) : (
                    <div className="w-full bg-neutral-900/50 border border-purple-500/20 rounded-2xl p-12 backdrop-blur-md flex flex-col items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                                <circle cx="9" cy="7" r="4" />
                                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            </svg>
                        </div>
                        <h2 className="text-xl font-bold text-white">Random 1v1 Chat</h2>
                        <p className="text-neutral-400 text-center max-w-md text-sm">
                            Get matched with a random stranger for a one-on-one conversation.
                        </p>
                        <a
                            href="/login"
                            className="mt-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-all"
                        >
                            Log in to Start
                        </a>
                    </div>
                )}
            </div>
        </PageShell>
    );
}
