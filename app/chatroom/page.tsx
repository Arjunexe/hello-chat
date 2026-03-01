import PageShell from "@/components/PageShell";

export default async function ChatroomPage() {
    return (
        <PageShell title="Chatroom">
            {/* Placeholder */}
            <div className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center gap-6">
                <div className="w-full bg-neutral-900/50 border border-purple-500/20 rounded-2xl p-12 backdrop-blur-md flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                            <path d="M17 6.1H3" />
                            <path d="M21 12.1H3" />
                            <path d="M15.1 18H3" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-bold text-white">Group Chatroom</h2>
                    <p className="text-neutral-400 text-center max-w-md">
                        Hang out and chat with everyone in real time. Jump into conversations, share thoughts, and vibe with the community.
                    </p>
                    <div className="mt-4 px-6 py-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-300 text-sm font-medium">
                        🚧 Coming Soon
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
