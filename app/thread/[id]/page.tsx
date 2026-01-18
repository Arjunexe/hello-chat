import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getThreadById } from "../action";
import { auth } from "@/auth";
import CommentForm from "./CommentForm";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ThreadExpand({ params }: PageProps) {
  // Protect this route
  const session = await auth();
  if (!session) {
    redirect("/login");
  }

  const { id } = await params;
  const thread = await getThreadById(id);

  if (!thread) {
    return notFound();
  }

  // Format relative time
  const formatTime = (dateString?: string) => {
    if (!dateString) return "Just now";
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  return (
    <main className="min-h-screen w-full bg-black text-white p-4 md:p-8 flex flex-col items-center">
      {/* Background gradient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />
        <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 w-full max-w-3xl">
        {/* Back Button */}
        <div className="mb-6">
          <Link
            href="/thread"
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-2 text-sm"
          >
            ← Back to Feed
          </Link>
        </div>

        {/* --- THE EXPANDED POST --- */}
        <div className="w-full bg-neutral-900/50 border border-purple-500/50 rounded-2xl overflow-hidden backdrop-blur-md">
          {/* Header */}
          <div className="p-6 border-b border-white/5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-600/20 flex items-center justify-center text-purple-400 font-bold">
              {thread.author[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-white font-semibold">@{thread.author}</h1>
              <p className="text-neutral-500 text-xs">
                Posted {formatTime(thread.createdAt)}
              </p>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 space-y-6">
            <p className="text-lg md:text-xl font-extrabold leading-relaxed text-neutral-100">
              {thread.title}
            </p>

            {/* Big Expanded Image */}
            {thread.image && (
              <div className="rounded-xl overflow-hidden border border-white/10">
                <img
                  src={thread.image}
                  alt="Thread attachment"
                  className="w-full h-auto max-h-[500px] object-cover"
                />
              </div>
            )}

            {thread.content && (
              <p className="text-neutral-300 leading-relaxed">{thread.content}</p>
            )}
          </div>

          {/* Stats Bar */}
          <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex gap-6 text-sm text-neutral-400">
            <span>{thread.likes || 0} Likes</span>
            <span>{thread.comments?.length || 0} Comments</span>
          </div>
        </div>

        {/* --- ADD COMMENT FORM --- */}
        <div className="mt-6">
          <CommentForm threadId={thread.id} />
        </div>

        {/* --- COMMENTS SECTION --- */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4 text-purple-200">Comments</h3>

          <div className="space-y-4">
            {thread.comments?.length === 0 ? (
              <p className="text-neutral-500 italic">
                No comments yet. Be the first!
              </p>
            ) : (
              thread.comments?.map((comment) => (
                <div
                  key={comment.id}
                  className="p-4 rounded-xl bg-white/5 border border-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-purple-400">
                      @{comment.user}
                    </span>
                    <span className="text-xs text-neutral-600">
                      {formatTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-neutral-300">{comment.text}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
