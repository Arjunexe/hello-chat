"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    {
        label: "Threads",
        href: "/thread",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                <line x1="9" y1="10" x2="15" y2="10" />
                <line x1="12" y1="7" x2="12" y2="13" />
            </svg>
        ),
    },
    {
        label: "Chatroom",
        href: "/chatroom",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 6.1H3" />
                <path d="M21 12.1H3" />
                <path d="M15.1 18H3" />
                <path d="M21 6.1a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
                <path d="M17 18a1 1 0 1 0 0-2 1 1 0 0 0 0 2z" fill="currentColor" />
            </svg>
        ),
    },
    {
        label: "1v1 Chat",
        href: "/chat",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
    },
    {
        label: "Profile",
        href: "/profile",
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
            </svg>
        ),
    },
];

export default function NavTabs() {
    const pathname = usePathname();

    return (
        <div className="flex items-center gap-1 bg-white/5 rounded-xl p-1 border border-white/10">
            {NAV_ITEMS.map((item) => {
                const isActive =
                    pathname === item.href || pathname.startsWith(item.href + "/");
                const isProfile = item.href === "/profile";

                return (
                    <span key={item.href} className="flex items-center">
                        {/* Subtle divider before profile */}
                        {isProfile && (
                            <span className="w-px h-5 bg-white/10 mx-1" />
                        )}
                        <Link
                            href={item.href}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all duration-200 whitespace-nowrap
                                ${isActive
                                    ? "bg-purple-600/30 text-purple-300 shadow-[0_0_12px_rgba(147,51,234,0.2)] border border-purple-500/30"
                                    : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                                }
                            `}
                        >
                            {item.icon}
                            {/* Profile is icon-only, others show label on sm+ */}
                            {!isProfile && (
                                <span className="hidden sm:inline">{item.label}</span>
                            )}
                        </Link>
                    </span>
                );
            })}
        </div>
    );
}
