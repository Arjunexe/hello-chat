import PageShell from "@/components/PageShell";
import { supabase } from "@/lib/supabase";
import { auth } from "@/auth";
import Link from "next/link";
import CreateChatroomForm from "./CreateChatroomForm";
import DeleteChatroomButton from "./DeleteChatroomButton";

export default async function ChatroomPage() {
    const session = await auth();

    const { data: chatrooms, error } = await supabase
        .from("chatrooms")
        .select("*")
        .order("created_at", { ascending: false });

    if (error) {
        console.error("Failed to fetch chatrooms:", error);
    }

    return (
        <PageShell
            title="Chatroom"
            rightContent={session?.user ? <CreateChatroomForm /> : null}
        >
            <div className="w-full max-w-3xl flex-1 flex flex-col gap-4">
                {!chatrooms || chatrooms.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20">
                        <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-lg font-bold text-white">No chatrooms yet</h2>
                        <p className="text-neutral-400 text-sm text-center max-w-sm">
                            {session?.user
                                ? "Be the first to create a chatroom! Hit the \"New Room\" button to get started."
                                : "Log in to create or join chatrooms."}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-3">
                        {chatrooms.map((room) => (
                            <Link
                                key={room.id}
                                href={`/chatroom/${room.id}`}
                                className="group relative flex items-center gap-4 p-4 rounded-2xl bg-neutral-900/60 border border-white/5 hover:border-purple-500/30 hover:bg-neutral-900/80 transition-all duration-300 backdrop-blur-sm"
                            >
                                {/* Room avatar */}
                                <div className="shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600/30 to-purple-800/30 border border-purple-500/20 flex items-center justify-center text-purple-300 font-bold text-lg group-hover:shadow-lg group-hover:shadow-purple-600/10 transition-all">
                                    {room.name.charAt(0).toUpperCase()}
                                </div>

                                {/* Room info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-white font-semibold text-sm truncate group-hover:text-purple-200 transition-colors">
                                        {room.name}
                                    </h3>
                                    {room.description && (
                                        <p className="text-neutral-500 text-xs mt-0.5 truncate">
                                            {room.description}
                                        </p>
                                    )}
                                    <p className="text-neutral-600 text-[11px] mt-1">
                                        Created by {room.created_by_username} ·{" "}
                                        {new Date(room.created_at).toLocaleDateString()}
                                    </p>
                                </div>

                                {/* Arrow + delete */}
                                <div className="flex items-center gap-1">
                                    {session?.user?.id && (
                                        <DeleteChatroomButton
                                            chatroomId={room.id}
                                            currentUserId={session.user.id}
                                            createdBy={room.created_by}
                                        />
                                    )}
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all">
                                        <polyline points="9 18 15 12 9 6" />
                                    </svg>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </PageShell>
    );
}
