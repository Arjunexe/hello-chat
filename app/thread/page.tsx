import ThreadButton from "@/components/threadComponents/ThreadButton";
import ThreadFeed from "@/components/ThreadFeed";
import PageShell from "@/components/PageShell";
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
    <PageShell
      title="Topics"
      rightContent={
        <>
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
        </>
      }
    >
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
    </PageShell>
  );
}
