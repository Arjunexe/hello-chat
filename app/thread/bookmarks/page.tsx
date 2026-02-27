import { auth } from "@/auth";
import { getBookmarkedThreads } from "../action";
import ThreadCard from "../ThreadCard";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function BookmarksPage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    const threads = await getBookmarkedThreads();

    return (
        <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
            {/* Background gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />
            </div>

            <div className="relative z-20 flex flex-col items-center w-full min-h-screen py-8 px-4">
                {/* Header */}
                <div className="w-full max-w-3xl mb-8">
                    <div className="mb-4">
                        <Link
                            href="/thread"
                            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
                        >
                            ← Back to Feed
                        </Link>
                    </div>
                    <div className="flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                            <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                        </svg>
                        <h1 className="text-2xl font-bold tracking-tight">Saved Threads</h1>
                    </div>
                    <p className="text-sm text-neutral-400 mt-1">
                        {threads.length} thread{threads.length !== 1 ? "s" : ""} saved
                    </p>
                </div>

                {/* Bookmarked threads */}
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    {threads.length === 0 ? (
                        <div className="text-center py-16 text-neutral-500">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-4 text-neutral-700">
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                            </svg>
                            <p className="text-lg">No saved threads yet</p>
                            <p className="text-sm mt-2">Bookmark threads to find them here later</p>
                        </div>
                    ) : (
                        threads.map((thread) => (
                            <ThreadCard
                                key={thread.id}
                                thread={thread}
                                currentUserId={session.user?.id ?? null}
                                isBookmarked={true}
                                isLoggedIn={true}
                            />
                        ))
                    )}
                </div>
            </div>
        </main>
    );
}
