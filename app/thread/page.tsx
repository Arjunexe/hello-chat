import ThreadButton from "@/components/threadComponents/ThreadButton";
import ThreadCard from "./ThreadCard";
import { getThreads } from "./action";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function ThreadPage() {
  // Protect this route - require authentication
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  // Fetch threads from the database
  const threads = await getThreads();

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
            <p className="text-sm text-neutral-400">Welcome, {session.user?.name}</p>
          </div>
          <ThreadButton />
        </div>

        {/* List of Threads */}
        <div className="w-full max-w-3xl flex flex-col gap-4">
          {threads.length === 0 ? (
            <div className="text-center py-12 text-neutral-500">
              <p className="text-lg">No threads yet</p>
              <p className="text-sm mt-2">Be the first to start a conversation!</p>
            </div>
          ) : (
            threads.map((thread) => (
              <ThreadCard key={thread.id} thread={thread} />
            ))
          )}
        </div>
      </div>
    </main>
  );
}
