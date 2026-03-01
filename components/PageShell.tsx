import { auth } from "@/auth";
import Link from "next/link";
import NavTabs from "@/components/NavTabs";

interface PageShellProps {
    title: string;
    children: React.ReactNode;
    rightContent?: React.ReactNode;
}

export default async function PageShell({ title, children, rightContent }: PageShellProps) {
    const session = await auth();

    return (
        <main className="relative min-h-screen w-full bg-black text-white overflow-x-hidden selection:bg-purple-500 selection:text-white">
            {/* --- STATIC BACKGROUNDS --- */}
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
                />
            </div>

            {/* --- CONTENT --- */}
            <div className="relative z-20 flex flex-col items-center w-full min-h-screen py-4 sm:py-8 px-3 sm:px-4">
                {/* Header */}
                <div className="w-full max-w-3xl mb-4 sm:mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    {/* Title + welcome - row with right content on mobile */}
                    <div className="flex items-center justify-between sm:block sm:shrink-0">
                        <div className="shrink-0">
                            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">{title}</h1>
                            <p className="text-xs sm:text-sm text-neutral-400">
                                {session?.user?.name
                                    ? <Link href="/profile" className="hover:text-purple-400 transition-colors">Welcome, {session.user.name}</Link>
                                    : <span>Browsing as guest · <Link href="/login" className="text-purple-400 hover:underline">Login</Link></span>
                                }
                            </p>
                        </div>
                        {/* Right content shows inline on mobile */}
                        <div className="flex items-center gap-2 sm:hidden">
                            {rightContent}
                        </div>
                    </div>

                    {/* Nav tabs - centered */}
                    <div className="flex justify-center">
                        <NavTabs />
                    </div>

                    {/* Right content - desktop only */}
                    <div className="hidden sm:flex items-center justify-end gap-3 sm:shrink-0">
                        {rightContent}
                    </div>
                </div>

                {/* Page Content */}
                {children}
            </div>
        </main>
    );
}
