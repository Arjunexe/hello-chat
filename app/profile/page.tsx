import PageShell from "@/components/PageShell";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import User from "@/lib/models/User";
import Thread from "@/lib/models/Threads";
import Comment from "@/lib/models/Comments";
import LogoutButton from "./LogoutButton";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user?.id) {
        redirect("/login");
    }

    await connectDB();

    const [user, threadCount, commentCount] = await Promise.all([
        User.findById(session.user.id).select("username email createdAt").lean(),
        Thread.countDocuments({ author: session.user.id }),
        Comment.countDocuments({ authorId: session.user.id }),
    ]);

    if (!user) {
        redirect("/login");
    }

    const joinedDate = new Date((user as any).createdAt).toLocaleDateString("en-US", {
        month: "long",
        year: "numeric",
    });

    const daysSinceJoined = Math.floor(
        (Date.now() - new Date((user as any).createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    return (
        <PageShell title="Profile">
            <div className="w-full max-w-3xl flex-1 flex flex-col gap-4 sm:gap-6">
                {/* User card */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900/60 border border-white/5 p-5 sm:p-8 backdrop-blur-sm">
                    {/* Subtle gradient accent */}
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600" />

                    <div className="flex items-start gap-4 sm:gap-6">
                        {/* Monogram avatar */}
                        <div className="shrink-0 w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-600/30 to-pink-600/30 border border-purple-500/20 flex items-center justify-center">
                            <span className="text-2xl sm:text-3xl font-bold text-purple-300">
                                {(user as any).username.charAt(0).toUpperCase()}
                            </span>
                        </div>

                        <div className="flex-1 min-w-0">
                            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                                {(user as any).username}
                            </h2>
                            <p className="text-neutral-500 text-xs sm:text-sm mt-0.5">
                                {(user as any).email}
                            </p>
                            <p className="text-neutral-600 text-[11px] sm:text-xs mt-1 flex items-center gap-1.5">
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-neutral-600">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                    <line x1="16" y1="2" x2="16" y2="6" />
                                    <line x1="8" y1="2" x2="8" y2="6" />
                                    <line x1="3" y1="10" x2="21" y2="10" />
                                </svg>
                                Joined {joinedDate}
                                {daysSinceJoined > 0 && (
                                    <span className="text-neutral-700">· {daysSinceJoined}d ago</span>
                                )}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-400">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span className="text-neutral-500 text-xs font-medium">Threads</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{threadCount}</p>
                    </div>

                    <div className="rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-4 sm:p-5">
                        <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-pink-400">
                                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                            </svg>
                            <span className="text-neutral-500 text-xs font-medium">Comments</span>
                        </div>
                        <p className="text-2xl sm:text-3xl font-bold text-white">{commentCount}</p>
                    </div>
                </div>

                {/* Account section */}
                <div className="rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-4 sm:p-5">
                    <h3 className="text-sm font-semibold text-neutral-300 mb-4">Account</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <div>
                                <p className="text-sm text-white">Username</p>
                                <p className="text-xs text-neutral-500">{(user as any).username}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2 border-b border-white/5">
                            <div>
                                <p className="text-sm text-white">Email</p>
                                <p className="text-xs text-neutral-500">{(user as any).email}</p>
                            </div>
                        </div>
                        <div className="flex items-center justify-between py-2">
                            <div>
                                <p className="text-sm text-white">Sign out</p>
                                <p className="text-xs text-neutral-500">End your current session</p>
                            </div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
