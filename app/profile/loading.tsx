import PageShell from "@/components/PageShell";

export default function ProfileLoading() {
    return (
        <PageShell title="Profile">
            <div className="w-full max-w-3xl flex-1 flex flex-col gap-4 sm:gap-6">
                {/* User card skeleton */}
                <div className="relative overflow-hidden rounded-xl sm:rounded-2xl bg-neutral-900/60 border border-white/5 p-5 sm:p-8">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-600/50 via-pink-500/50 to-purple-600/50 animate-pulse" />
                    <div className="flex items-start gap-4 sm:gap-6">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-white/5 animate-pulse" />
                        <div className="flex-1 space-y-2">
                            <div className="h-6 w-32 rounded-lg bg-white/5 animate-pulse" />
                            <div className="h-4 w-48 rounded-lg bg-white/5 animate-pulse" />
                            <div className="h-3 w-28 rounded-lg bg-white/5 animate-pulse" />
                        </div>
                    </div>
                </div>

                {/* Stats skeleton */}
                <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    {[0, 1].map((i) => (
                        <div key={i} className="rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-4 sm:p-5">
                            <div className="h-4 w-16 rounded bg-white/5 animate-pulse mb-3" />
                            <div className="h-8 w-12 rounded bg-white/5 animate-pulse" />
                        </div>
                    ))}
                </div>

                {/* Account skeleton */}
                <div className="rounded-xl sm:rounded-2xl bg-neutral-900/40 border border-white/5 p-4 sm:p-5">
                    <div className="h-4 w-20 rounded bg-white/5 animate-pulse mb-4" />
                    <div className="space-y-4">
                        {[0, 1, 2].map((i) => (
                            <div key={i} className="h-10 rounded bg-white/5 animate-pulse" />
                        ))}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
