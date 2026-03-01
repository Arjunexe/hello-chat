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
