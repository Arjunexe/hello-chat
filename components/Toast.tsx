"use client";

import { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from "react";

type ToastType = "success" | "error" | "info";

interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

interface ToastContextValue {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
    const context = useContext(ToastContext);
    if (!context) throw new Error("useToast must be used within ToastProvider");
    return context;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = useState<Toast[]>([]);
    const idRef = useRef(0);

    const addToast = useCallback((message: string, type: ToastType) => {
        const id = ++idRef.current;
        setToasts((prev) => [...prev, { id, message, type }]);
        setTimeout(() => {
            setToasts((prev) => prev.filter((t) => t.id !== id));
        }, 3500);
    }, []);

    const toast = useMemo<ToastContextValue>(
        () => ({
            success: (msg: string) => addToast(msg, "success"),
            error: (msg: string) => addToast(msg, "error"),
            info: (msg: string) => addToast(msg, "info"),
        }),
        [addToast]
    );

    return (
        <ToastContext.Provider value={toast}>
            {children}
            {/* Toast container */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full">
                {toasts.map((t) => (
                    <ToastItem key={t.id} toast={t} onDismiss={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))} />
                ))}
            </div>
        </ToastContext.Provider>
    );
}

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
    const [isVisible, setIsVisible] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    useEffect(() => {
        // Animate in
        requestAnimationFrame(() => setIsVisible(true));
        // Animate out before removal
        const exitTimer = setTimeout(() => setIsExiting(true), 3000);
        return () => clearTimeout(exitTimer);
    }, []);

    const bgColor = {
        success: "border-green-500/40 bg-green-500/10",
        error: "border-red-500/40 bg-red-500/10",
        info: "border-purple-500/40 bg-purple-500/10",
    }[toast.type];

    const iconColor = {
        success: "text-green-400",
        error: "text-red-400",
        info: "text-purple-400",
    }[toast.type];

    const icon = {
        success: "✓",
        error: "✕",
        info: "ℹ",
    }[toast.type];

    return (
        <div
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-xl shadow-2xl transition-all duration-300 cursor-pointer ${bgColor} ${isVisible && !isExiting
                ? "opacity-100 translate-x-0"
                : "opacity-0 translate-x-8"
                }`}
            onClick={onDismiss}
        >
            <span className={`text-lg font-bold ${iconColor} shrink-0`}>{icon}</span>
            <p className="text-sm text-white/90 leading-snug">{toast.message}</p>
        </div>
    );
}
