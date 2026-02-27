export default function ThreadCardSkeleton() {
    return (
        <div className="w-full rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg overflow-hidden animate-pulse">
            {/* Main content area */}
            <div className="p-5 pb-3">
                {/* Header: avatar + name + time */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-5 w-24 bg-white/10 rounded-md" />
                    <div className="h-3 w-12 bg-white/5 rounded-md" />
                </div>

                {/* Content: title + body + optional image */}
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                    <div className="flex-1 min-w-0 space-y-3">
                        <div className="h-5 w-3/4 bg-white/10 rounded-md" />
                        <div className="h-4 w-full bg-white/5 rounded-md" />
                        <div className="h-4 w-2/3 bg-white/5 rounded-md" />
                    </div>

                    {/* Image placeholder (show on ~half the skeletons) */}
                    <div className="shrink-0 w-full md:w-32">
                        <div className="w-full h-48 md:h-32 rounded-xl bg-white/5" />
                    </div>
                </div>
            </div>

            {/* Footer bar */}
            <div className="bg-black/20 px-4 py-3 flex items-center gap-6 border-t border-white/5">
                <div className="h-4 w-12 bg-white/5 rounded-md" />
                <div className="h-4 w-12 bg-white/5 rounded-md" />
                <div className="h-4 w-12 bg-white/5 rounded-md" />
            </div>
        </div>
    );
}
