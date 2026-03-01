import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { notFound, redirect } from "next/navigation";
import DMChatWindow from "./DMChatWindow";

interface DMSessionPageProps {
    params: Promise<{ sessionId: string }>;
}

export default async function DMSessionPage({ params }: DMSessionPageProps) {
    const { sessionId } = await params;
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    // Fetch session info
    const { data: dmSession, error } = await supabase
        .from("dm_sessions")
        .select("*")
        .eq("id", sessionId)
        .single();

    if (error || !dmSession) {
        notFound();
    }

    // Verify user is a participant
    const isParticipant =
        dmSession.user1_id === session.user.id ||
        dmSession.user2_id === session.user.id;

    if (!isParticipant) {
        notFound();
    }

    // Determine partner
    const partnerUsername =
        dmSession.user1_id === session.user.id
            ? dmSession.user2_username
            : dmSession.user1_username;

    // Get total message count
    const { count: totalMessageCount } = await supabase
        .from("dm_messages")
        .select("*", { count: "exact", head: true })
        .eq("session_id", sessionId);

    // Fetch initial messages
    const { data: messages } = await supabase
        .from("dm_messages")
        .select("*")
        .eq("session_id", sessionId)
        .order("created_at", { ascending: true })
        .limit(50);

    return (
        <PageShell title="1v1 Chat">
            <div className="w-full max-w-3xl flex-1 flex flex-col">
                {/* Partner info bar */}
                <div className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 mb-2 sm:mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                            {partnerUsername.charAt(0).toUpperCase()}
                        </div>
                        <div>
                            <h2 className="text-white font-semibold text-xs sm:text-sm">
                                Chatting with <span className="text-purple-300">{partnerUsername}</span>
                            </h2>
                            <p className="text-neutral-500 text-[11px]">
                                {dmSession.status === "active" ? (
                                    <span className="flex items-center gap-1">
                                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                                        Active
                                    </span>
                                ) : (
                                    "Ended"
                                )}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {dmSession.status === "active" && (
                            <span className="text-[10px] text-neutral-600">
                                {totalMessageCount || 0} messages
                            </span>
                        )}
                    </div>
                </div>

                {/* Chat window */}
                <div className="relative flex-1 rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-2 sm:p-4 backdrop-blur-sm">
                    <DMChatWindow
                        sessionId={sessionId}
                        partnerUsername={partnerUsername}
                        initialMessages={messages || []}
                        currentUserId={session.user.id}
                        currentUsername={session.user.name || "You"}
                        totalMessageCount={totalMessageCount || 0}
                    />
                </div>
            </div>
        </PageShell>
    );
}
