export default function ThreadDetailLoading() {
    return (
        <main className="min-h-screen w-full bg-black text-white p-4 md:p-8 flex flex-col items-center">
            {/* Background gradient */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-900/55 via-black to-black" />
                <div className="absolute inset-0 bg-gradient-to-bl from-purple-900/40 via-transparent to-transparent" />
            </div>

            <div className="relative z-10 w-full max-w-3xl animate-pulse">
                {/* Back button skeleton */}
                <div className="mb-6">
                    <div className="h-4 w-28 bg-white/10 rounded-md" />
                </div>

                {/* Main card skeleton */}
                <div className="w-full bg-neutral-900/50 border border-purple-500/20 rounded-2xl overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-600/20" />
                        <div className="space-y-2">
                            <div className="h-4 w-24 bg-white/10 rounded-md" />
                            <div className="h-3 w-32 bg-white/5 rounded-md" />
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-6 space-y-6">
                        <div className="h-6 w-3/4 bg-white/10 rounded-md" />
                        <div className="h-[400px] w-full bg-white/5 rounded-xl" />
                        <div className="space-y-2">
                            <div className="h-4 w-full bg-white/5 rounded-md" />
                            <div className="h-4 w-2/3 bg-white/5 rounded-md" />
                        </div>
                    </div>

                    {/* Stats bar */}
                    <div className="px-6 py-4 bg-black/20 border-t border-white/5 flex items-center justify-between">
                        <div className="flex gap-6">
                            <div className="h-4 w-16 bg-white/5 rounded-md" />
                            <div className="h-4 w-20 bg-white/5 rounded-md" />
                        </div>
                        <div className="h-4 w-16 bg-white/5 rounded-md" />
                    </div>
                </div>

                {/* Comment form skeleton */}
                <div className="mt-6">
                    <div className="h-24 w-full bg-white/5 rounded-xl border border-white/5" />
                </div>

                {/* Comments skeleton */}
                <div className="mt-8 space-y-4">
                    <div className="h-5 w-28 bg-white/10 rounded-md" />
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                            <div className="flex justify-between">
                                <div className="h-4 w-20 bg-purple-500/20 rounded-md" />
                                <div className="h-3 w-16 bg-white/5 rounded-md" />
                            </div>
                            <div className="h-4 w-full bg-white/5 rounded-md" />
                            <div className="h-4 w-1/2 bg-white/5 rounded-md" />
                        </div>
                    ))}
                </div>
            </div>
        </main>
    );
}
