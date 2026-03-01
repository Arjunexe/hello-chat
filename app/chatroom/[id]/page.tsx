import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import { notFound } from "next/navigation";
import Link from "next/link";
import ChatWindow from "./ChatWindow";
import RoomSettings from "./RoomSettings";

interface ChatroomDetailPageProps {
    params: Promise<{ id: string }>;
}

export default async function ChatroomDetailPage({ params }: ChatroomDetailPageProps) {
    const { id } = await params;
    const session = await auth();

    // Fetch chatroom info
    const { data: chatroom, error: chatroomError } = await supabase
        .from("chatrooms")
        .select("*")
        .eq("id", id)
        .single();

    if (chatroomError || !chatroom) {
        notFound();
    }

    // Get total message count for pagination
    const { count: totalMessageCount } = await supabase
        .from("messages")
        .select("*", { count: "exact", head: true })
        .eq("chatroom_id", id);

    // Fetch initial messages (latest 50)
    const { data: messages } = await supabase
        .from("messages")
        .select("*")
        .eq("chatroom_id", id)
        .order("created_at", { ascending: true })
        .limit(50);

    const isCreator = session?.user?.id === chatroom.created_by;

    return (
        <PageShell
            title={chatroom.name}
            rightContent={
                <div className="flex items-center gap-2">
                    {isCreator && (
                        <RoomSettings
                            chatroomId={id}
                            currentName={chatroom.name}
                            currentDescription={chatroom.description || ""}
                        />
                    )}
                    <Link
                        href="/chatroom"
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-neutral-400 hover:text-white hover:bg-white/5 transition-all border border-white/5"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="15 18 9 12 15 6" />
                        </svg>
                        All Rooms
                    </Link>
                </div>
            }
        >
            <div className="w-full max-w-3xl flex-1 flex flex-col">
                {/* Room info bar */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/40 border border-white/5 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-sm">
                        {chatroom.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                        <h2 className="text-white font-semibold text-sm truncate">{chatroom.name}</h2>
                        {chatroom.description && (
                            <p className="text-neutral-500 text-xs truncate">{chatroom.description}</p>
                        )}
                    </div>
                    <span className="text-[10px] text-neutral-600 shrink-0">
                        {totalMessageCount || 0} messages
                    </span>
                </div>

                {/* Chat window */}
                <div className="flex-1 rounded-2xl bg-neutral-900/40 border border-white/5 p-4 backdrop-blur-sm">
                    <ChatWindow
                        chatroomId={id}
                        initialMessages={messages || []}
                        currentUserId={session?.user?.id || null}
                        currentUsername={session?.user?.name || null}
                        totalMessageCount={totalMessageCount || 0}
                    />
                </div>
            </div>
        </PageShell>
    );
}
