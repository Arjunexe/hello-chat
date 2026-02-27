import ThreadCardSkeleton from "@/components/ThreadCardSkeleton";

export default function ThreadLoading() {
    return (
        <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden">
            {/* Background gradients (same as page) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />
            </div>

            <div className="relative z-20 flex flex-col items-center w-full min-h-screen py-8 px-4">
                {/* Header skeleton */}
                <div className="w-full max-w-3xl mb-8 flex items-center justify-between">
                    <div>
                        <div className="h-7 w-24 bg-white/10 rounded-md animate-pulse" />
                        <div className="h-4 w-40 bg-white/5 rounded-md mt-2 animate-pulse" />
                    </div>
                    <div className="h-9 w-28 bg-purple-600/30 rounded-lg animate-pulse" />
                </div>

                {/* Thread card skeletons */}
                <div className="w-full max-w-3xl flex flex-col gap-4">
                    <ThreadCardSkeleton />
                    <ThreadCardSkeleton />
                    <ThreadCardSkeleton />
                    <ThreadCardSkeleton />
                </div>
            </div>
        </main>
    );
}
