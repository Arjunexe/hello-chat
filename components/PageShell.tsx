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
            <div className="relative z-20 flex flex-col items-center w-full min-h-screen py-8 px-4">
                {/* Header */}
                <div className="w-full max-w-3xl mb-8 grid grid-cols-3 items-center">
                    <div className="shrink-0">
                        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
                        <p className="text-sm text-neutral-400">
                            {session?.user?.name
                                ? `Welcome, ${session.user.name}`
                                : <span>Browsing as guest · <Link href="/login" className="text-purple-400 hover:underline">Login</Link></span>
                            }
                        </p>
                    </div>
                    <div className="flex justify-center">
                        <NavTabs />
                    </div>
                    <div className="flex items-center justify-end gap-3">
                        {rightContent}
                    </div>
                </div>

                {/* Page Content */}
                {children}
            </div>
        </main>
    );
}
