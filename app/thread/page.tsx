import ThreadButton from "@/components/threadComponents/ThreadButton";
import ThreadFeed from "@/components/ThreadFeed";
import { getThreadsPaginated, getUserBookmarkIds } from "./action";
import { auth } from "@/auth";
import Link from "next/link";

export default async function ThreadPage() {
  const session = await auth();

  // Fetch first page of threads + user's bookmarks
  const [{ threads, nextCursor, hasMore }, bookmarkIds] = await Promise.all([
    getThreadsPaginated(),
    session?.user?.id ? getUserBookmarkIds() : Promise.resolve([]),
  ]);

  return (
    <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
      {/* --- STATIC BACKGROUNDS (Server Rendered) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />
      </div>
      <div className="fixed inset-0 z-10 opacity-20 pointer-events-none mix-blend-overlay">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      {/* --- FEED --- */}
      <div className="relative z-20 flex flex-col items-center w-full min-h-screen py-8 px-4">
        {/* Header */}
        <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Topics</h1>
            <p className="text-sm text-neutral-400">
              {session?.user?.name
                ? `Welcome, ${session.user.name}`
                : <span>Browsing as guest · <Link href="/login" className="text-purple-400 hover:underline">Login</Link></span>
              }
            </p>
          </div>
          <div className="flex items-center gap-3">
            {session && (
              <Link
                href="/thread/bookmarks"
                className="text-neutral-400 hover:text-yellow-400 transition-colors p-2 rounded-lg hover:bg-white/5"
                title="Saved threads"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z" />
                </svg>
              </Link>
            )}
            {session ? (
              <ThreadButton />
            ) : (
              <Link
                href="/login"
                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(147,51,234,0.3)]"
              >
                Login to Post
              </Link>
            )}
          </div>
        </div>

        {/* Thread Feed with Infinite Scroll */}
        <div className="w-full max-w-3xl flex flex-col gap-4">
          <ThreadFeed
            initialThreads={threads}
            initialNextCursor={nextCursor}
            initialHasMore={hasMore}
            currentUserId={session?.user?.id ?? null}
            bookmarkIds={bookmarkIds}
            isLoggedIn={!!session}
          />
        </div>
      </div>
    </main>
  );
}
