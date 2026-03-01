import PageShell from "@/components/PageShell";

export default function DMSessionLoading() {
    return (
        <PageShell title="1v1 Chat">
            <div className="w-full max-w-3xl flex-1 flex flex-col gap-3">
                {/* Partner info skeleton */}
                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-neutral-900/40 border border-white/5">
                    <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
                    <div className="space-y-2">
                        <div className="h-4 w-36 rounded-lg bg-white/5 animate-pulse" />
                        <div className="h-3 w-16 rounded-lg bg-white/5 animate-pulse" />
                    </div>
                </div>

                {/* Chat area skeleton */}
                <div className="flex-1 rounded-2xl bg-neutral-900/40 border border-white/5 p-4">
                    <div className="space-y-6 py-8">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex gap-3" style={{ opacity: 1 - i * 0.2 }}>
                                <div className="w-8 h-8 rounded-full bg-white/5 animate-pulse shrink-0" />
                                <div className="space-y-1.5">
                                    <div className="h-3 w-20 rounded bg-white/5 animate-pulse" />
                                    <div
                                        className="h-8 rounded-2xl bg-white/5 animate-pulse"
                                        style={{ width: `${100 + Math.random() * 180}px` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </PageShell>
    );
}
